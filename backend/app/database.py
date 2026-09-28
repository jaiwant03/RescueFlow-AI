import logging
import asyncio
from typing import Optional, Dict, Any, List
try:
    from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
except ImportError:
    AsyncIOMotorClient = Any
    AsyncIOMotorDatabase = Any
from app.config import settings

logger = logging.getLogger("rescueflow.database")

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    is_connected: bool = False
    is_fallback: bool = False

db_manager = Database()

# In-memory storage fallback for resilient hackathon evaluation
class InMemoryCollection:
    def __init__(self, name: str):
        self.name = name
        self.docs: List[Dict[str, Any]] = []

    async def insert_one(self, doc: Dict[str, Any]):
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(len(self.docs) + 1)
        self.docs.append(doc_copy)
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc_copy["_id"])

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for d in reversed(self.docs):
            match = True
            for k, v in query.items():
                if d.get(k) != v:
                    match = False
                    break
            if match:
                return dict(d)
        return None

    def find(self, query: Optional[Dict[str, Any]] = None):
        q = query or {}
        class Cursor:
            def __init__(self, docs, q):
                self.matched = []
                for d in docs:
                    m = True
                    for k, v in q.items():
                        if isinstance(v, dict):
                            # Basic $ne, $in, $gte support
                            if "$ne" in v and d.get(k) == v["$ne"]:
                                m = False
                            if "$in" in v and d.get(k) not in v["$in"]:
                                m = False
                        elif d.get(k) != v:
                            m = False
                            break
                    if m:
                        self.matched.append(dict(d))
                self.sort_key = None
                self.sort_dir = 1
                self.skip_n = 0
                self.limit_n = None

            def sort(self, key_or_list, direction=1):
                if isinstance(key_or_list, list):
                    self.sort_key = key_or_list[0][0]
                    self.sort_dir = key_or_list[0][1]
                else:
                    self.sort_key = key_or_list
                    self.sort_dir = direction
                return self

            def skip(self, n: int):
                self.skip_n = n
                return self

            def limit(self, n: int):
                self.limit_n = n
                return self

            async def to_list(self, length: Optional[int] = None):
                res = list(self.matched)
                if self.sort_key:
                    res.sort(key=lambda x: x.get(self.sort_key, ""), reverse=(self.sort_dir == -1))
                if self.skip_n:
                    res = res[self.skip_n:]
                if self.limit_n:
                    res = res[:self.limit_n]
                elif length:
                    res = res[:length]
                return res

            def __aiter__(self):
                self._iter = iter(self.matched)
                return self

            async def __anext__(self):
                try:
                    return next(self._iter)
                except StopIteration:
                    raise StopAsyncIteration
        return Cursor(self.docs, q)

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        cur = self.find(query)
        res = await cur.to_list(None)
        return len(res)

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        for d in self.docs:
            match = True
            for k, v in query.items():
                if d.get(k) != v:
                    match = False
                    break
            if match:
                if "$set" in update:
                    d.update(update["$set"])
                if "$inc" in update:
                    for ik, iv in update["$inc"].items():
                        d[ik] = d.get(ik, 0) + iv
                if "$push" in update:
                    for pk, pv in update["$push"].items():
                        if pk not in d:
                            d[pk] = []
                        if isinstance(pv, dict) and "$each" in pv:
                            d[pk].extend(pv["$each"])
                        else:
                            d[pk].append(pv)
                class UpdateResult:
                    matched_count = 1
                    modified_count = 1
                return UpdateResult()
        class UpdateResultZero:
            matched_count = 0
            modified_count = 0
        return UpdateResultZero()

    async def delete_many(self, query: Dict[str, Any]):
        before = len(self.docs)
        self.docs = [d for d in self.docs if not all(d.get(k) == v for k, v in query.items())]
        class DeleteResult:
            deleted_count = before - len(self.docs)
        return DeleteResult()

class InMemoryDatabase:
    def __init__(self):
        self.collections: Dict[str, InMemoryCollection] = {}

    def __getitem__(self, name: str) -> InMemoryCollection:
        if name not in self.collections:
            self.collections[name] = InMemoryCollection(name)
        return self.collections[name]

in_memory_db = InMemoryDatabase()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB at %s...", settings.MONGO_URI)
    try:
        if AsyncIOMotorClient is Any:
            raise ImportError("Motor module not available in active environment.")
        db_manager.client = AsyncIOMotorClient(
            settings.MONGO_URI,
            serverSelectionTimeoutMS=2000
        )
        # Check connection
        await db_manager.client.admin.command('ping')
        db_manager.db = db_manager.client[settings.DB_NAME]
        db_manager.is_connected = True
        db_manager.is_fallback = False
        logger.info("Connected to MongoDB successfully: database '%s'", settings.DB_NAME)
        
        # Ensure indexes
        try:
            await db_manager.db["incidents"].create_index("incident_id", unique=True)
            await db_manager.db["incidents"].create_index("status")
            await db_manager.db["incidents"].create_index("priority_level")
            await db_manager.db["incidents"].create_index("created_at")
            await db_manager.db["messages"].create_index("message_id", unique=True)
            await db_manager.db["audit_logs"].create_index("timestamp")
        except Exception as idx_err:
            logger.warning("Index creation note: %s", idx_err)
            
    except Exception as e:
        logger.warning("Could not connect to live MongoDB (%s). Using in-memory database fallback.", e)
        db_manager.db = in_memory_db
        db_manager.is_connected = False
        db_manager.is_fallback = True

async def close_mongo_connection():
    if db_manager.client:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()
        db_manager.is_connected = False
        logger.info("MongoDB connection closed.")

def get_database():
    if db_manager.db is None:
        return in_memory_db
    return db_manager.db
