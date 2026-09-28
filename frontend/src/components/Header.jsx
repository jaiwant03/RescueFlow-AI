import React from 'react';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
import { Shield, Cpu, Database, Workflow, Clock, User, AlertOctagon } from 'lucide-react';

export function Header() {
  const { systemStatus, currentTime } = useSystem();
  const { user } = useAuth();

  const getStatusColor = (healthy) => (healthy ? '#10b981' : '#f59e0b');

  return (
    <header
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
          }}
        >
          <Shield size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em', color: '#ffffff' }}>
              RESCUEFLOW <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
            </h1>
            <span
              style={{
                fontSize: '0.68rem',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <AlertOctagon size={11} /> SIMULATION MODE
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            AI-Powered Disaster Message Prioritization & Response Automation
          </p>
        </div>
      </div>

      {/* System Telemetry & Live Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* n8n Status */}
        <div
          title={`n8n Orchestrator: ${systemStatus.n8n?.status}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.76rem',
            background: 'var(--bg-card)',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Workflow size={14} color="#f97316" />
          <span style={{ color: 'var(--text-secondary)' }}>n8n:</span>
          <span style={{ fontWeight: 600, color: systemStatus.n8n?.status === 'connected' ? '#10b981' : '#f59e0b' }}>
            {systemStatus.n8n?.status === 'connected' ? 'ACTIVE' : 'READY'}
          </span>
          <span
            className="status-dot"
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: systemStatus.n8n?.status === 'connected' ? '#10b981' : '#f59e0b',
            }}
          />
        </div>

        {/* Groq AI Status */}
        <div
          title={`Groq Model: ${systemStatus.groq_ai?.model}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.76rem',
            background: 'var(--bg-card)',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Cpu size={14} color="#06b6d4" />
          <span style={{ color: 'var(--text-secondary)' }}>Groq AI:</span>
          <span style={{ fontWeight: 600, color: systemStatus.groq_ai?.healthy ? '#10b981' : '#ef4444' }}>
            {systemStatus.groq_ai?.has_api_key ? 'LLAMA-3.3' : 'ONLINE (HEURISTIC)'}
          </span>
          <span
            className="status-dot"
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#10b981',
            }}
          />
        </div>

        {/* MongoDB Status */}
        <div
          title={`MongoDB: ${systemStatus.mongodb?.status}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.76rem',
            background: 'var(--bg-card)',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Database size={14} color="#10b981" />
          <span style={{ color: 'var(--text-secondary)' }}>MongoDB:</span>
          <span style={{ fontWeight: 600, color: '#10b981' }}>
            {systemStatus.mongodb?.status === 'connected' ? 'CONNECTED' : 'LOCAL'}
          </span>
          <span
            className="status-dot"
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#10b981',
            }}
          />
        </div>

        {/* Live Clock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)',
            background: 'var(--bg-main)',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Clock size={13} color="var(--accent-cyan)" />
          <span>{currentTime}</span>
        </div>

        {/* User Identity */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '10px',
            borderLeft: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
            }}
          >
            <User size={16} />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
              {user ? user.name : 'Duty Officer'}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {user ? user.role : 'Command Lead'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
