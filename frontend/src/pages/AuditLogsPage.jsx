import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
  Layers,
  Send
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [incidentIdFilter, setIncidentIdFilter] = useState('');
  const [copied, setCopied] = useState(false);

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

  // Derived audit stats
  const stats = useMemo(() => {
    const total = logs.length;
    const aiActions = logs.filter(l => l.event_type?.includes('AI_')).length;
    const dispatches = logs.filter(l => l.event_type === 'NOTIFICATION_SENT' || l.event_type === 'APPROVED').length;
    const dedups = logs.filter(l => l.event_type === 'DUPLICATE_DETECTED').length;
    return { total, aiActions, dispatches, dedups };
  }, [logs]);

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

  const handleCopyJson = () => {
    if (!selectedEvent) return;
    navigator.clipboard.writeText(JSON.stringify(selectedEvent, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <span style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(2, 132, 199, 0.1) 100%)',
              border: '1px solid rgba(13, 148, 136, 0.25)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ScrollText size={20} color="var(--rama-green)" />
            </span>
            <span className="heading-cursive-multicolor">System Audit & Compliance Trail</span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px', marginBottom: 0, fontWeight: 500 }}>
            Deterministic log of all intake normalization, AI triage classifications, human sign-offs, and automated dispatches
          </p>
        </div>

        <button 
          onClick={loadAuditLogs} 
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
            padding: '8px 16px',
            borderRadius: '10px',
            color: '#0f766e',
            fontWeight: 600,
            fontSize: '0.84rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <RotateCw size={14} className={loading ? 'spin' : ''} /> 
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* 4 Summary Stat Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '16px 18px', border: '1.5px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#0f766e', fontWeight: 700, textTransform: 'uppercase' }}>Total Audit Records</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#042f2e', marginTop: '4px', lineHeight: 1 }}>{stats.total}</div>
            <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '4px' }}>Immutable ledger events</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
            <ScrollText size={20} />
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '16px 18px', border: '1.5px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>AI Inference Events</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#082f49', marginTop: '4px', lineHeight: 1 }}>{stats.aiActions}</div>
            <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '4px' }}>Groq entity extractions</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <Cpu size={20} />
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '16px 18px', border: '1.5px solid #d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Dispatches & Approvals</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#065f46', marginTop: '4px', lineHeight: 1 }}>{stats.dispatches}</div>
            <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '4px' }}>Authorizations recorded</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Send size={20} />
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '16px 18px', border: '1.5px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#6d28d9', fontWeight: 700, textTransform: 'uppercase' }}>Deduplication Matches</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2e1065', marginTop: '4px', lineHeight: 1 }}>{stats.dedups}</div>
            <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '4px' }}>Corroborated reports</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <Layers size={20} />
          </div>
        </div>
      </div>

      {/* Modeled Filter Bar */}
      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
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
            color="#94a3b8"
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
              border: '1.5px solid #cbd5e1',
              fontSize: '0.84rem',
              outline: 'none',
              background: '#f8fafc',
              color: '#0f172a',
              transition: 'all 0.15s ease',
            }}
            onFocus={(e) => {
              e.target.style.background = '#ffffff';
              e.target.style.borderColor = 'var(--rama-green)';
            }}
            onBlur={(e) => {
              e.target.style.background = '#f8fafc';
              e.target.style.borderColor = '#cbd5e1';
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
                color: '#94a3b8',
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
            minWidth="200px"
          />

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.80rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Reset filters"
            >
              <RotateCcw size={13} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div 
        style={{ 
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          overflow: 'hidden' 
        }}
      >
        {loading ? (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
            <RotateCw size={24} className="spin" style={{ margin: '0 auto 12px', color: 'var(--rama-green)' }} />
            <div>Loading verified audit trail...</div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
            No audit records match the selected filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="eoc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.74rem', color: '#475569', fontWeight: 800, textAlign: 'left', letterSpacing: '0.04em' }}>TIMESTAMP</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.74rem', color: '#475569', fontWeight: 800, textAlign: 'left', letterSpacing: '0.04em' }}>EVENT TYPE</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.74rem', color: '#475569', fontWeight: 800, textAlign: 'left', letterSpacing: '0.04em' }}>INCIDENT ID</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.74rem', color: '#475569', fontWeight: 800, textAlign: 'left', letterSpacing: '0.04em' }}>SOURCE CHANNEL</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.74rem', color: '#475569', fontWeight: 800, textAlign: 'left', letterSpacing: '0.04em' }}>ACTOR</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.74rem', color: '#475569', fontWeight: 800, textAlign: 'left', letterSpacing: '0.04em' }}>DETAILS PREVIEW</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.74rem', color: '#475569', fontWeight: 800, textAlign: 'center', letterSpacing: '0.04em' }}>PAYLOAD</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr 
                    key={idx}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: '0.80rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.73rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '6px',
                          background: '#f0fdfa',
                          color: '#0f766e',
                          border: '1px solid #ccfbf1',
                          display: 'inline-block'
                        }}
                      >
                        {log.event_type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {log.incident_id ? (
                        <Link 
                          to={`/incidents/${log.incident_id}`} 
                          style={{ 
                            color: '#0284c7', 
                            fontWeight: 700, 
                            fontFamily: 'var(--font-mono)', 
                            textDecoration: 'none',
                            fontSize: '0.82rem'
                          }}
                        >
                          {log.incident_id}
                        </Link>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textTransform: 'uppercase', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                      {log.source || 'SYSTEM'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>
                      {log.actor || 'System'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#334155', maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                      {JSON.stringify(log.details || {})}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedEvent(log)}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.74rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: '#ffffff',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          color: '#0f766e',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--rama-green)';
                          e.currentTarget.style.color = '#042f2e';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.color = '#0f766e';
                        }}
                      >
                        <Code size={13} /> JSON
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
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
              border: '1.5px solid #e2e8f0',
              borderRadius: '16px',
              padding: '22px',
              width: '90%',
              maxWidth: '600px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 className="heading-cursive-multicolor" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  Audit Event: {selectedEvent.event_type}
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                  Recorded at {new Date(selectedEvent.timestamp).toLocaleString()}
                </span>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#64748b', 
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <pre
              style={{
                background: '#0f172a',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '0.80rem',
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)',
                overflowX: 'auto',
                maxHeight: '360px',
                border: '1px solid #334155'
              }}
            >
              {JSON.stringify(selectedEvent, null, 2)}
            </pre>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <button
                onClick={handleCopyJson}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '9px',
                  border: '1.5px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Payload'}</span>
              </button>

              <button 
                onClick={() => setSelectedEvent(null)} 
                style={{
                  padding: '8px 18px',
                  borderRadius: '9px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0077b6 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogsPage;
