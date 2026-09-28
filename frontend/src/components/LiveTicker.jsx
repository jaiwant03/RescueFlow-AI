import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Radio } from 'lucide-react';

export function LiveTicker() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.getAuditLogs({ limit: 5 });
        if (res && res.audit_logs) {
          setLogs(res.audit_logs);
        }
      } catch (e) {
        // silent
      }
    };
    fetchRecent();
    const interval = setInterval(fetchRecent, 12000);
    return () => clearInterval(interval);
  }, []);

  if (logs.length === 0) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #f0fdfa 0%, #e0f2fe 50%, #f0fdfa 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '6px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.75rem',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--rama-deep)', fontWeight: 800 }}>
        <Radio size={12} color="var(--rama-green)" />
        <span>LIVE TELEMETRY:</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', overflow: 'hidden' }}>
        {logs.map((log, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--peacock-primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span style={{ fontWeight: 700, color: 'var(--peacock-deep)' }}>
              [{log.event_type}]
            </span>
            <span>
              {log.incident_id ? `#${log.incident_id}` : ''} &bull; {log.actor}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LiveTicker;
