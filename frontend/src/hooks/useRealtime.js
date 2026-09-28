import { useEffect, useRef } from 'react';
import { api } from '../services/api';

export function useRealtime(onEvent) {
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const baseUrl = api.getBaseUrl();
    const sseUrl = `${baseUrl}/api/realtime/events`;

    const connect = () => {
      try {
        const es = new EventSource(sseUrl);
        eventSourceRef.current = es;

        es.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (onEvent) {
              onEvent(parsed);
            }
          } catch (e) {
            // keepalive or non-json message
          }
        };

        es.onerror = () => {
          es.close();
          // Retry connection in 5 seconds
          setTimeout(connect, 5000);
        };
      } catch (err) {
        console.warn('Realtime SSE connection failed, retrying in 5s...', err);
        setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [onEvent]);
}

export default useRealtime;
