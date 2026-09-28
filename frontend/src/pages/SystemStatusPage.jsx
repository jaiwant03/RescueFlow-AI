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
  Code,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles
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
    return (
      <div 
        style={{ 
          padding: '60px 20px', 
          textAlign: 'center', 
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          color: '#64748b' 
        }}
      >
        <RotateCw size={26} className="spin" style={{ margin: '0 auto 12px', color: 'var(--rama-green)' }} />
        <div style={{ fontWeight: 600, fontSize: '0.94rem' }}>Probing Subsystem Health & n8n Architecture...</div>
      </div>
    );
  }

  const { components, system } = statusData;

  const workflowsList = [
    { 
      id: '01', 
      name: '01_emergency_intake.json', 
      desc: 'Multi-channel intake (Telegram, Email, Web, CSV), normalization & Groq classification pipeline',
      category: 'Intake & Normalization',
      color: '#0d9488'
    },
    { 
      id: '02', 
      name: '02_incident_intelligence.json', 
      desc: 'Groq entity extraction, deterministic priority calculation & similarity deduplication check',
      category: 'Intelligence & Triage',
      color: '#0284c7'
    },
    { 
      id: '03', 
      name: '03_human_approval.json', 
      desc: 'Critical incident human authorization queue, decision callbacks, and audit registration',
      category: 'Human-in-the-Loop',
      color: '#ea580c'
    },
    { 
      id: '04', 
      name: '04_automated_response.json', 
      desc: 'Autonomous multi-channel notification dispatch to field units via Telegram & Email',
      category: 'Autonomous Dispatch',
      color: '#10b981'
    },
    { 
      id: '05', 
      name: '05_incident_monitoring.json', 
      desc: 'Scheduled cron monitoring cycle, heartbeat health verification & staleness escalation',
      category: 'Monitoring & Crons',
      color: '#8b5cf6'
    },
  ];

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
              <Server size={20} color="var(--rama-green)" />
            </span>
            <span className="heading-cursive-multicolor">Subsystem Health & n8n Architecture</span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px', marginBottom: 0, fontWeight: 500 }}>
            Live status of FastAPI Backend, MongoDB Database, Groq AI Engine, and n8n Workflow Orchestrator
          </p>
        </div>

        <button 
          onClick={loadStatus} 
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
          <span>Re-Probe Subsystems</span>
        </button>
      </div>

      {/* Primary Subsystem Health Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Backend API */}
        <div 
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #ccfbf1',
            boxShadow: '0 4px 14px rgba(13, 148, 136, 0.05)',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #0d9488 0%, #14b8a6 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
                <Server size={18} />
              </div>
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                FastAPI Backend Core
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', padding: '3px 9px', borderRadius: '20px', fontWeight: 800, border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              ONLINE
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '8px' }}>
            Version: <strong style={{ color: '#0f172a' }}>{system.version}</strong> &bull; Mode: <strong style={{ color: '#0f766e' }}>{system.mode}</strong>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            REST API, WebSocket Streams, and SSE Events Active
          </div>
        </div>

        {/* n8n Orchestrator */}
        <div 
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #fed7aa',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.05)',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                <Workflow size={18} />
              </div>
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                n8n Orchestration Core
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#fff7ed', color: '#c2410c', padding: '3px 9px', borderRadius: '20px', fontWeight: 800, border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ea580c' }} />
              {components.n8n?.status?.toUpperCase() || 'READY'}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '8px' }}>
            Port: <code style={{ color: '#c2410c', fontWeight: 700 }}>5678</code> &bull; Engine: <strong style={{ color: '#0f172a' }}>n8n Autonomous</strong>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            URL: <code style={{ color: '#0f766e' }}>{components.n8n?.base_url}</code>
          </div>
        </div>

        {/* Groq AI */}
        <div 
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #bae6fd',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.05)',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                <Cpu size={18} />
              </div>
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                Groq AI Inference
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#f0f9ff', color: '#0369a1', padding: '3px 9px', borderRadius: '20px', fontWeight: 800, border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7' }} />
              {components.groq_ai?.has_api_key ? 'GROQ CLOUD' : 'HEURISTIC ACTIVE'}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '8px' }}>
            Model: <code style={{ color: '#0369a1', fontWeight: 700 }}>{components.groq_ai?.model || 'llama-3.3-70b-versatile'}</code>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            Fast extraction & classification with JSON schema enforcement
          </div>
        </div>

        {/* MongoDB */}
        <div 
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #d1fae5',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.05)',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Database size={18} />
              </div>
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                MongoDB Database
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', padding: '3px 9px', borderRadius: '20px', fontWeight: 800, border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              {components.mongodb?.status?.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '8px' }}>
            Database: <code style={{ color: '#047857', fontWeight: 700 }}>{components.mongodb?.db_name || 'rescueflow'}</code>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            URI: <code style={{ color: '#475569' }}>{components.mongodb?.uri}</code>
          </div>
        </div>
      </div>

      {/* Central n8n Orchestrator Architecture Card */}
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
              <Workflow size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                n8n Central Orchestration Layer Workflows
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Autonomous event-driven pipeline coordinating intake, triage, human approval, and dispatch
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f766e', background: '#f0fdfa', padding: '4px 10px', borderRadius: '8px', border: '1px solid #ccfbf1' }}>
            5 Production Workflows
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {workflowsList.map((wf) => (
            <div
              key={wf.id}
              style={{
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = wf.color;
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span 
                    style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.72rem', 
                      background: '#ffffff', 
                      color: wf.color, 
                      padding: '2px 8px', 
                      borderRadius: '6px', 
                      fontWeight: 800, 
                      border: `1.5px solid ${wf.color}` 
                    }}
                  >
                    WF-{wf.id}
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                    {wf.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                    {wf.category}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                  {wf.desc}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                  style={{ 
                    fontSize: '0.75rem', 
                    color: '#047857', 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '5px',
                    background: '#ecfdf5',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #a7f3d0'
                  }}
                >
                  <CheckCircle2 size={14} color="#10b981" /> ACTIVE & READY
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SystemStatusPage;
