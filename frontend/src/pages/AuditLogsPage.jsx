import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { 
  ScrollText, 
  RotateCw, 
  Search, 
  Filter, 
  Code, 
  Clock, 
  X,
  ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [incidentIdFilter, setIncidentIdFilter] = useState('');

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (eventTypeFilter !== 'all') params.event_type = eventTypeFilter;
      if (incidentIdFilter.trim()) params.incident_id = incidentIdFilter.trim();

      const res = await api.getAuditLogs(params);
      setLogs(res.audit_logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [eventTypeFilter, incidentIdFilter]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const eventTypes = [
    'all',
    'MESSAGE_RECEIVED',
    'AI_CLASSIFIED',
    'AI_EXTRACTED',
    'INCIDENT_CREATED',
    'INCIDENT_UPDATED',
    'DUPLICATE_DETECTED',
    'PRIORITY_CALCULATED',
    'APPROVAL_REQUESTED',
    'APPROVED',
    'REJECTED',
    'NOTIFICATION_SENT',
    'STATUS_CHANGED',
    'TEAM_ASSIGNED',
    'RESOLVED',
    'SYSTEM_RESET',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ScrollText size={22} color="var(--rama-green)" />
            <span className="heading-cursive-multicolor">System Audit & Compliance Trail</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Complete audit logging of all AI classification, extraction, merging, and response actions
          </p>
        </div>

        <button onClick={loadAuditLogs} className="btn btn-secondary">
          <RotateCw size={14} /> Refresh Logs
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className="eoc-card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Filter by Incident ID (e.g., INC-001024)..."
            value={incidentIdFilter}
            onChange={(e) => setIncidentIdFilter(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Event Type:</span>
          <select value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)}>
            {eventTypes.map((et) => (
              <option key={et} value={et}>
                {et === 'all' ? 'All Event Types' : et}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="eoc-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading audit records...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No audit records match the filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="eoc-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>Incident ID</th>
                  <th>Source Channel</th>
                  <th>Actor Designation</th>
                  <th>Details Preview</th>
                  <th>Payload</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx}>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: 'rgba(6, 182, 212, 0.12)',
                          color: 'var(--accent-cyan)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                        }}
                      >
                        {log.event_type}
                      </span>
                    </td>
                    <td>
                      {log.incident_id ? (
                        <Link to={`/incidents/${log.incident_id}`} style={{ color: 'var(--peacock-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          {log.incident_id}
                        </Link>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {log.source || 'SYSTEM'}
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--peacock-deep)' }}>
                      {log.actor || 'System'}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#94a3b8', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {JSON.stringify(log.details || {})}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedEvent(log)}
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '0.72rem', gap: '4px' }}
                      >
                        <Code size={11} /> JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Payload Inspector Modal */}
      {selectedEvent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 39, 56, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '20px',
              width: '90%',
              maxWidth: '560px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 className="heading-cursive-multicolor" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  Audit Event: {selectedEvent.event_type}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Recorded at {new Date(selectedEvent.timestamp).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setSelectedEvent(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <pre
              style={{
                background: 'var(--bg-main)',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                color: 'var(--accent-cyan)',
                fontFamily: 'var(--font-mono)',
                overflowX: 'auto',
                maxHeight: '340px',
              }}
            >
              {JSON.stringify(selectedEvent, null, 2)}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button onClick={() => setSelectedEvent(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogsPage;
