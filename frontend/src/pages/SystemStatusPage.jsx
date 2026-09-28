import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { 
  Server, 
  Workflow, 
  Cpu, 
  Database, 
  Send, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCw,
  ExternalLink,
  Code
} from 'lucide-react';

export function SystemStatusPage() {
  const { refreshStatus } = useSystem();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getSystemStatus();
      setStatusData(res);
      refreshStatus();
    } catch (err) {
      console.error('Failed to load system status:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshStatus]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  if (loading || !statusData) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Probing system subsystem health...</div>;
  }

  const { components, system } = statusData;

  const workflowsList = [
    { id: '01', name: '01_emergency_intake.json', desc: 'Telegram/Email/Web intake, normalization & Groq classification' },
    { id: '02', name: '02_incident_intelligence.json', desc: 'Groq extraction, deduplication check & priority calculation' },
    { id: '03', name: '03_human_approval.json', desc: 'Critical incident human authorization queue & callback webhook' },
    { id: '04', name: '04_automated_response.json', desc: 'Simulated Telegram & Email dispatch upon authorization' },
    { id: '05', name: '05_incident_monitoring.json', desc: 'Scheduled cron monitoring cycle & staleness escalation' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Server size={22} color="var(--accent-cyan)" /> System Health & n8n Architecture
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Live status of backend services, MongoDB database, Groq AI inference, and n8n workflows
          </p>
        </div>

        <button onClick={loadStatus} className="btn btn-secondary">
          <RotateCw size={14} /> Re-Probe System
        </button>
      </div>

      {/* Primary Subsystem Health Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Backend API */}
        <div className="eoc-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} color="#10b981" /> FastAPI Backend
            </span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              ONLINE
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Version: {system.version} &bull; Mode: {system.mode}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            REST Endpoints, WebSockets, and SSE Event Stream active
          </div>
        </div>

        {/* n8n Orchestrator */}
        <div className="eoc-card" style={{ borderLeft: `4px solid ${components.n8n?.healthy ? '#10b981' : '#f59e0b'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Workflow size={18} color="#f97316" /> n8n Orchestration Core
            </span>
            <span style={{ fontSize: '0.72rem', background: components.n8n?.healthy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: components.n8n?.healthy ? '#10b981' : '#f59e0b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              {components.n8n?.status?.toUpperCase() || 'READY'}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Base URL: <code style={{ color: 'var(--accent-cyan)' }}>{components.n8n?.base_url}</code>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Webhook: <code style={{ color: 'var(--text-secondary)' }}>{components.n8n?.webhook_url}</code>
          </div>
        </div>

        {/* Groq AI */}
        <div className="eoc-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="var(--accent-cyan)" /> Groq AI Engine
            </span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              {components.groq_ai?.has_api_key ? 'GROQ CLOUD' : 'HEURISTIC ACTIVE'}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Configured Model: <code style={{ color: '#ffffff' }}>{components.groq_ai?.model}</code>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            OpenAI-compatible /chat/completions with strict JSON parsing
          </div>
        </div>

        {/* MongoDB */}
        <div className="eoc-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="#10b981" /> MongoDB
            </span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              {components.mongodb?.status?.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Database: <code style={{ color: '#ffffff' }}>{components.mongodb?.db_name}</code>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            URI: <code style={{ color: 'var(--text-secondary)' }}>{components.mongodb?.uri}</code>
          </div>
        </div>
      </div>

      {/* Central n8n Orchestrator Architecture Card */}
      <div className="eoc-card">
        <div className="eoc-card-header">
          <div className="eoc-card-title">
            <Workflow size={18} color="#f97316" />
            <span>n8n Central Orchestration Layer Workflows</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
            5 Production Workflows in /n8n/workflows/
          </span>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          In RescueFlow AI, n8n is the core orchestration hub coordinating message intake, normalization, AI evaluation, similarity grouping, human approvals, and multi-channel responses.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {workflowsList.map((wf) => (
            <div
              key={wf.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    WF-{wf.id}
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    {wf.name}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {wf.desc}
                </div>
              </div>

              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> READY TO IMPORT
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SystemStatusPage;
