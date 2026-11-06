import asyncio
import logging
import time
import hashlib
from typing import Dict, Any, Callable, Awaitable, Optional, List
from datetime import datetime

logger = logging.getLogger("rescueflow.task_queue")

class TaskItem:
    def __init__(
        self,
        task_id: str,
        task_type: str,
        payload: Dict[str, Any],
        handler: Callable[[Dict[str, Any]], Awaitable[Any]],
        max_retries: int = 3,
        backoff_factor: float = 1.5,
        idempotency_key: Optional[str] = None
    ):
        self.task_id = task_id
        self.task_type = task_type
        self.payload = payload
        self.handler = handler
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor
        self.idempotency_key = idempotency_key or task_id
        self.retry_count = 0
        self.created_at = time.time()
        self.last_error: Optional[str] = None
        self.status = "queued"

class BackgroundTaskQueue:
    """
    High-throughput asynchronous task queue with concurrency control,
    exponential backoff retries, idempotency guards, and dead-letter tracking.
    """
    def __init__(self, concurrency: int = 5, max_queue_size: int = 5000):
        self.concurrency = concurrency
        self.max_queue_size = max_queue_size
        self._queue: asyncio.Queue[TaskItem] = asyncio.Queue(maxsize=max_queue_size)
        self._workers: List[asyncio.Task] = []
        self._running = False
        self._processed_keys: Dict[str, float] = {}  # idempotency cache
        self.dead_letter_queue: List[Dict[str, Any]] = []
        
        # Telemetry metrics
        self.metrics = {
            "tasks_enqueued": 0,
            "tasks_completed": 0,
            "tasks_failed": 0,
            "tasks_retried": 0,
            "dead_letter_count": 0,
            "avg_latency_ms": 0.0,
            "total_latency_ms": 0.0
        }

    async def start(self):
        """Starts background workers."""
        if self._running:
            return
        self._running = True
        for i in range(self.concurrency):
            worker = asyncio.create_task(self._worker_loop(i))
            self._workers.append(worker)
        logger.info(f"BackgroundTaskQueue initialized with {self.concurrency} concurrent async workers.")

    async def stop(self):
        """Gracefully drains and stops workers."""
        self._running = False
        for worker in self._workers:
            worker.cancel()
        await asyncio.gather(*self._workers, return_exceptions=True)
        self._workers.clear()
        logger.info("BackgroundTaskQueue stopped gracefully.")

    async def enqueue(
        self,
        task_type: str,
        payload: Dict[str, Any],
        handler: Callable[[Dict[str, Any]], Awaitable[Any]],
        task_id: Optional[str] = None,
        idempotency_key: Optional[str] = None,
        max_retries: int = 3
    ) -> Dict[str, Any]:
        """
        Enqueues a task asynchronously without blocking caller.
        Enforces idempotency to prevent duplicate job execution.
        """
        tid = task_id or f"TASK-{hashlib.md5(str(time.time()).encode()).hexdigest()[:8].upper()}"
        key = idempotency_key or tid

        # 1. Idempotency check (within 120-second rolling window)
        now = time.time()
        # Clean expired keys > 300s
        self._processed_keys = {k: ts for k, ts in self._processed_keys.items() if now - ts < 300}
        if key in self._processed_keys:
            logger.info(f"Duplicate task '{key}' suppressed by idempotency guard.")
            return {"status": "duplicate_suppressed", "task_id": tid, "idempotency_key": key}

        self._processed_keys[key] = now

        item = TaskItem(
            task_id=tid,
            task_type=task_type,
            payload=payload,
            handler=handler,
            max_retries=max_retries,
            idempotency_key=key
        )

        try:
            self._queue.put_nowait(item)
            self.metrics["tasks_enqueued"] += 1
            return {"status": "enqueued", "task_id": tid, "queue_depth": self._queue.qsize()}
        except asyncio.QueueFull:
            logger.error(f"Task queue full ({self.max_queue_size}). Task {tid} rejected.")
            return {"status": "rejected_queue_full", "task_id": tid}

    async def _worker_loop(self, worker_id: int):
        while self._running:
            try:
                task = await self._queue.get()
                t_start = time.time()
                success = False

                while task.retry_count <= task.max_retries and not success:
                    try:
                        task.status = "processing"
                        await task.handler(task.payload)
                        success = True
                        task.status = "completed"
                        latency = (time.time() - t_start) * 1000.0
                        self.metrics["tasks_completed"] += 1
                        self.metrics["total_latency_ms"] += latency
                        if self.metrics["tasks_completed"] > 0:
                            self.metrics["avg_latency_ms"] = round(
                                self.metrics["total_latency_ms"] / self.metrics["tasks_completed"], 2
                            )
                    except Exception as exc:
                        task.last_error = str(exc)
                        task.retry_count += 1
                        if task.retry_count <= task.max_retries:
                            self.metrics["tasks_retried"] += 1
                            delay = task.backoff_factor ** task.retry_count
                            logger.warning(
                                f"[Worker-{worker_id}] Task {task.task_id} failed: {exc}. "
                                f"Retrying ({task.retry_count}/{task.max_retries}) in {delay:.1f}s..."
                            )
                            await asyncio.sleep(delay)
                        else:
                            # Route to dead letter queue
                            task.status = "dead_letter"
                            self.metrics["tasks_failed"] += 1
                            self.metrics["dead_letter_count"] += 1
                            dlq_entry = {
                                "task_id": task.task_id,
                                "task_type": task.task_type,
                                "payload": task.payload,
                                "error": str(exc),
                                "retries": task.retry_count,
                                "failed_at": datetime.utcnow().isoformat()
                            }
                            self.dead_letter_queue.append(dlq_entry)
                            logger.error(f"[Worker-{worker_id}] Task {task.task_id} moved to DEAD-LETTER queue.")

                self._queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"[Worker-{worker_id}] Unexpected error in worker loop: {e}")
                await asyncio.sleep(0.5)

    def get_telemetry(self) -> Dict[str, Any]:
        """Returns live task queue telemetry."""
        return {
            "queue_depth": self._queue.qsize(),
            "concurrency": self.concurrency,
            "metrics": dict(self.metrics),
            "dead_letter_queue_size": len(self.dead_letter_queue),
            "idempotency_cache_size": len(self._processed_keys)
        }

# Global singleton background task queue
task_queue = BackgroundTaskQueue(concurrency=5)
