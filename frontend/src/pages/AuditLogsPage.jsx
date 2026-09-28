import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { ModeledSelect } from '../components/ModeledSelect';
import { 
  ScrollText, 
  RotateCw, 
  RotateCcw,
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

  const eventTypeOptions = [
    { value: 'all', label: 'All Event Types' },
    { value: 'MESSAGE_RECEIVED', label: 'Message Received', dotColor: '#3b82f6' },
    { value: 'AI_CLASSIFIED', label: 'AI Classified', dotColor: '#8b5cf6' },
    { value: 'AI_EXTRACTED', label: 'AI Extracted', dotColor: '#a855f7' },
    { value: 'INCIDENT_CREATED', label: 'Incident Created', dotColor: '#ef4444' },
    { value: 'INCIDENT_UPDATED', label: 'Incident Updated', dotColor: '#f97316' },
    { value: 'DUPLICATE_DETECTED', label: 'Duplicate Detected', dotColor: '#06b6d4' },
    { value: 'PRIORITY_CALCULATED', label: 'Priority Calculated', dotColor: '#eab308' },
    { value: 'APPROVAL_REQUESTED', label: 'Approval Requested', dotColor: '#f59e0b' },
    { value: 'APPROVED', label: 'Approved', dotColor: '#0284c7' },
    { value: 'REJECTED', label: 'Rejected', dotColor: '#64748b' },
    { value: 'NOTIFICATION_SENT', label: 'Notification Sent', dotColor: '#10b981' },
    { value: 'STATUS_CHANGED', label: 'Status Changed', dotColor: '#3b82f6' },
    { value: 'TEAM_ASSIGNED', label: 'Team Assigned', dotColor: '#14b8a6' },
    { value: 'RESOLVED', label: 'Resolved', dotColor: '#10b981' },
    { value: 'SYSTEM_RESET', label: 'System Reset', dotColor: '#dc2626' },
  ];

  const hasActiveFilters = incidentIdFilter.trim() !== '' || eventTypeFilter !== 'all';

  const resetFilters = () => {
    setIncidentIdFilter('');
    setEventTypeFilter('all');
  };

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

      {/* Modeled Filter Bar */}
      <div
        className="eoc-card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 2px 10px rgba(0, 50, 70, 0.04), 0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            flex: '1 1 240px',
            maxWidth: '380px',
          }}
        >
          <Search
            size={16}
            color="var(--rama-green)"
            style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Filter by Incident ID (e.g., INC-001024)..."
            value={incidentIdFilter}
            onChange={(e) => setIncidentIdFilter(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '36px',
              paddingRight: incidentIdFilter ? '32px' : '14px',
              paddingTop: '8px',
              paddingBottom: '8px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.84rem',
              outline: 'none',
              background: '#ffffff',
              transition: 'all 0.15s ease',
            }}
          />
          {incidentIdFilter && (
            <button
              onClick={() => setIncidentIdFilter('')}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <ModeledSelect
            label="Event Type:"
            value={eventTypeFilter}
            onChange={setEventTypeFilter}
            options={eventTypeOptions}
            minWidth="190px"
          />

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Reset filters"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
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
