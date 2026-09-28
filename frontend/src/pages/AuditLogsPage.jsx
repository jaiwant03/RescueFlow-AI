import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { ModeledSelect } from '../components/ModeledSelect';
import { useSystem } from '../context/SystemContext';
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
  Send,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Activity,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuditLogsPage() {
  const { addToast } = useSystem();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [incidentIdFilter, setIncidentIdFilter] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Clear all confirmation modal
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

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

  const handleClearAllConfirm = async () => {
    try {
      setClearing(true);
      await api.clearAuditLogs();
      addToast('Audit Logs Purged', 'All audit ledger records have been permanently cleared from database.', 'info');
      setConfirmClearOpen(false);
      loadAuditLogs();
    } catch (err) {
      addToast('Purge Failed', err.response?.data?.detail || err.message, 'warning');
    } finally {
      setClearing(false);
    }
  };

  // Helper for rendering structured details
  const renderDetailsPreview = (details) => {
    if (!details || typeof details !== 'object' || Object.keys(details).length === 0) {
      return <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.78rem' }}>Empty payload</span>;
    }

    if (details.old_status && details.new_status) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 7px', borderRadius: '5px', fontSize: '0.74rem', fontWeight: 700 }}>
            {details.old_status}
          </span>
          <span style={{ color: '#0d9488', fontWeight: 800 }}>&rarr;</span>
          <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 7px', borderRadius: '5px', fontSize: '0.74rem', fontWeight: 700 }}>
            {details.new_status}
          </span>
          {details.reason && (
            <span style={{ color: '#64748b', fontSize: '0.74rem' }}>
              &bull; {details.reason}
            </span>
          )}
        </div>
      );
    }

    if (details.assigned_team) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0f766e', fontWeight: 700, fontSize: '0.79rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0d9488' }} />
          Assigned field team: <strong style={{ color: '#042f2e' }}>"{details.assigned_team}"</strong>
        </span>
      );
    }

    if (details.channels) {
      const chs = Array.isArray(details.channels) ? details.channels.join(', ') : String(details.channels);
      return (
        <span style={{ color: '#0369a1', fontWeight: 600, fontSize: '0.78rem' }}>
          Channels: <strong style={{ color: '#0284c7' }}>{chs}</strong>
          {details.simulated && <span style={{ color: '#64748b', marginLeft: '4px' }}>(simulated)</span>}
        </span>
      );
    }

    if (details.reason) {
      return (
        <span style={{ color: '#b91c1c', fontWeight: 600, fontSize: '0.78rem' }}>
          Note: {details.reason}
        </span>
      );
    }

    if (details.resources) {
      const res = Array.isArray(details.resources) ? details.resources.join(', ') : String(details.resources);
      return (
        <span style={{ color: '#475569', fontWeight: 600, fontSize: '0.78rem' }}>
          Units: <strong style={{ color: '#0f172a' }}>{res}</strong>
        </span>
      );
    }

    return (
      <span style={{ color: '#334155', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
        {JSON.stringify(details)}
      </span>
    );
  };

  // Color-coded Event Type Badges
  const getEventBadge = (type) => {
    switch (type) {
      case 'STATUS_CHANGED':
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6' };
      case 'TEAM_ASSIGNED':
        return { bg: '#f0fdfa', color: '#0f766e', border: '#ccfbf1', dot: '#0d9488' };
      case 'NOTIFICATION_SENT':
      case 'APPROVED':
      case 'RESOLVED':
        return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', dot: '#10b981' };
      case 'REJECTED':
      case 'SYSTEM_RESET':
        return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', dot: '#ef4444' };
      case 'AI_CLASSIFIED':
      case 'AI_EXTRACTED':
        return { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff', dot: '#8b5cf6' };
      case 'DUPLICATE_DETECTED':
        return { bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc', dot: '#06b6d4' };
      case 'INCIDENT_CREATED':
      case 'INCIDENT_UPDATED':
        return { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', dot: '#f97316' };
      default:
        return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', dot: '#94a3b8' };
    }
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
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.12)'
            }}>
              <ScrollText size={20} color="var(--rama-green)" />
            </span>
            <span className="heading-cursive-multicolor" style={{ display: 'inline-block', paddingRight: '8px' }}>
              System Audit & Compliance Trail
            </span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px', marginBottom: 0, fontWeight: 500 }}>
            Deterministic log of all intake normalization, AI triage classifications, human sign-offs, and automated dispatches
          </p>
        </div>

        {/* Top Right Action Buttons: Refresh + Clear All */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={loadAuditLogs} 
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
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

          <button 
            onClick={() => setConfirmClearOpen(true)} 
            disabled={logs.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              border: '1.5px solid #fecaca',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.04)',
              padding: '8px 16px',
              borderRadius: '10px',
              color: logs.length === 0 ? '#94a3b8' : '#dc2626',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
              opacity: logs.length === 0 ? 0.6 : 1,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (logs.length > 0) {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.borderColor = '#f87171';
              }
            }}
            onMouseLeave={(e) => {
              if (logs.length > 0) {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#fecaca';
              }
            }}
          >
            <Trash2 size={14} color={logs.length === 0 ? '#94a3b8' : '#dc2626'} /> 
            <span>Clear All Logs</span>
          </button>
        </div>
      </div>

      {/* 4 Modeled Summary Stat Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Card 1: Total Records */}
        <div 
          style={{ 
            background: '#ffffff', 
            borderRadius: '16px', 
            padding: '18px 20px', 
            border: '1.5px solid #ccfbf1', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            boxShadow: '0 8px 20px -4px rgba(13, 148, 136, 0.08), 0 2px 6px -1px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '3.5px', background: 'linear-gradient(90deg, #0d9488 0%, #14b8a6 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div>
            <div style={{ fontSize: '0.74rem', color: '#0f766e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Audit Records
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#042f2e', margin: '4px 0 2px', lineHeight: 1 }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Immutable ledger events</div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
            <ScrollText size={22} />
          </div>
        </div>

        {/* Card 2: AI Actions */}
        <div 
          style={{ 
            background: '#ffffff', 
            borderRadius: '16px', 
            padding: '18px 20px', 
            border: '1.5px solid #bae6fd', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.08), 0 2px 6px -1px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '3.5px', background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div>
            <div style={{ fontSize: '0.74rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              AI Inference Events
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#082f49', margin: '4px 0 2px', lineHeight: 1 }}>
              {stats.aiActions}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Groq entity extractions</div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <Cpu size={22} />
          </div>
        </div>

        {/* Card 3: Dispatches */}
        <div 
          style={{ 
            background: '#ffffff', 
            borderRadius: '16px', 
            padding: '18px 20px', 
            border: '1.5px solid #d1fae5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.08), 0 2px 6px -1px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '3.5px', background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div>
            <div style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Dispatches & Approvals
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#065f46', margin: '4px 0 2px', lineHeight: 1 }}>
              {stats.dispatches}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Authorizations recorded</div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Send size={22} />
          </div>
        </div>

        {/* Card 4: Deduplications */}
        <div 
          style={{ 
            background: '#ffffff', 
            borderRadius: '16px', 
            padding: '18px 20px', 
            border: '1.5px solid #ddd6fe', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            boxShadow: '0 8px 20px -4px rgba(139, 92, 246, 0.08), 0 2px 6px -1px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '3.5px', background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div>
            <div style={{ fontSize: '0.74rem', color: '#6d28d9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Deduplication Matches
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2e1065', margin: '4px 0 2px', lineHeight: 1 }}>
              {stats.dedups}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Corroborated reports</div>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <Layers size={22} />
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
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
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
              e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.12)';
            }}
            onBlur={(e) => {
              e.target.style.background = '#f8fafc';
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.boxShadow = 'none';
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

      {/* Audit Log Table Container */}
      <div 
        style={{ 
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 8px 24px -4px rgba(0,0,0,0.04)',
          overflow: 'hidden' 
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <RotateCw size={26} className="spin" style={{ margin: '0 auto 12px', color: 'var(--rama-green)' }} />
            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Loading verified audit ledger...</div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div 
              style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: '#f0fdfa', 
                color: 'var(--rama-green)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px' 
              }}
            >
              <ShieldCheck size={32} />
            </div>
            <h3 className="heading-cursive-multicolor" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
              Audit Ledger Clean & Up to Date
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              No audit records currently match your query. Any simulated dispatches, incident updates, or automated notifications will automatically record immutable compliance entries here.
            </p>
            <button 
              onClick={loadAuditLogs}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.84rem'
              }}
            >
              <RotateCw size={14} /> Check for New Audit Traces
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="eoc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  <th style={{ padding: '13px 18px', fontSize: '0.74rem', color: '#475569', fontWeight: 800, textAlign: 'left', letterSpacing: '0.04em' }}>TIMESTAMP</th>
                  <th style={{ padding: '13px 18px', fontSize: '0.74rem', color: '#475569', fontWeight: 800, textAlign: 'left', letterSpacing: '0.04em' }}>EVENT TYPE</th>
                  <th style={{ padding: '13px 18px', fontSize: '0.74rem', color: '#475569', fontWeight: 800, textAlign: 'left', letterSpacing: '0.04em' }}>INCIDENT ID</th>
                  <th style={{ padding: '13px 18px', fontSize: '0.74rem', color: '#475569', fontWeight: 800, textAlign: 'left', letterSpacing: '0.04em' }}>SOURCE CHANNEL</th>
                  <th style={{ padding: '13px 18px', fontSize: '0.74rem', color: '#475569', fontWeight: 800, textAlign: 'left', letterSpacing: '0.04em' }}>ACTOR</th>
                  <th style={{ padding: '13px 18px', fontSize: '0.74rem', color: '#475569', fontWeight: 800, textAlign: 'left', letterSpacing: '0.04em' }}>DETAILS PREVIEW</th>
                  <th style={{ padding: '13px 18px', fontSize: '0.74rem', color: '#475569', fontWeight: 800, textAlign: 'center', letterSpacing: '0.04em' }}>PAYLOAD</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const badge = getEventBadge(log.event_type);

                  return (
                    <tr 
                      key={idx}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      {/* Timestamp */}
                      <td style={{ padding: '12px 18px', fontSize: '0.80rem', color: '#334155', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>

                      {/* Event Type Badge */}
                      <td style={{ padding: '12px 18px' }}>
                        <span
                          style={{
                            fontSize: '0.73rem',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '20px',
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: badge.dot }} />
                          {log.event_type}
                        </span>
                      </td>

                      {/* Incident ID */}
                      <td style={{ padding: '12px 18px' }}>
                        {log.incident_id ? (
                          <Link 
                            to={`/incidents/${log.incident_id}`} 
                            style={{ 
                              color: '#0284c7', 
                              fontWeight: 700, 
                              fontFamily: 'var(--font-mono)', 
                              textDecoration: 'none',
                              fontSize: '0.82rem',
                              background: '#f0f9ff',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid #bae6fd',
                              display: 'inline-block'
                            }}
                          >
                            {log.incident_id}
                          </Link>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>-</span>
                        )}
                      </td>

                      {/* Source Channel */}
                      <td style={{ padding: '12px 18px' }}>
                        <span
                          style={{
                            textTransform: 'uppercase',
                            fontSize: '0.74rem',
                            color: '#475569',
                            fontWeight: 700,
                            background: '#f1f5f9',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          {log.source || 'SYSTEM'}
                        </span>
                      </td>

                      {/* Actor */}
                      <td style={{ padding: '12px 18px', fontWeight: 800, fontSize: '0.83rem', color: '#0f172a' }}>
                        {log.actor || 'System'}
                      </td>

                      {/* Details Preview (Structured Human-Readable) */}
                      <td style={{ padding: '12px 18px', fontSize: '0.82rem', maxWidth: '380px' }}>
                        {renderDetailsPreview(log.details)}
                      </td>

                      {/* Payload Inspect Button */}
                      <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedEvent(log)}
                          style={{
                            padding: '4px 11px',
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
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      {confirmClearOpen && (
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
              border: '1.5px solid #fecaca',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '12px', 
                  background: '#fee2e2', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#dc2626',
                  flexShrink: 0
                }}
              >
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Purge All Audit Trail Records?
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
                  Irreversible compliance action
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to permanently clear all <strong>{stats.total} audit records</strong> from the MongoDB ledger? This will reset all historical traces and timestamps.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                disabled={clearing}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleClearAllConfirm}
                disabled={clearing}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: clearing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)'
                }}
              >
                {clearing ? (
                  <>
                    <RotateCw size={14} className="spin" /> Purging...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Yes, Purge All Logs
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
