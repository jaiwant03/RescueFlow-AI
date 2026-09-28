import React from 'react';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
import { Shield, Cpu, Database, Workflow, Clock, User, AlertOctagon } from 'lucide-react';

export function Header() {
  const { systemStatus, currentTime } = useSystem();
  const { user } = useAuth();

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
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            background: 'var(--gradient-peacock-rama)',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0, 91, 130, 0.25)',
          }}
        >
          <Shield size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--peacock-deep)' }}>
              RESCUEFLOW <span style={{ color: 'var(--rama-green)' }}>AI</span>
            </h1>
            <span
              style={{
                fontSize: '0.68rem',
                background: 'var(--priority-critical-bg)',
                border: '1px solid var(--priority-critical-border)',
                color: 'var(--priority-critical)',
                padding: '2px 8px',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* n8n Status */}
        <div
          title={`n8n Orchestrator: ${systemStatus.n8n?.status}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.76rem',
            background: 'var(--bg-main)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Workflow size={14} color="var(--peacock-light)" />
          <span style={{ color: 'var(--text-secondary)' }}>n8n:</span>
          <span style={{ fontWeight: 700, color: systemStatus.n8n?.status === 'connected' ? 'var(--rama-green)' : '#ea580c' }}>
            {systemStatus.n8n?.status === 'connected' ? 'ACTIVE' : 'READY'}
          </span>
          <span
            className="status-dot"
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: systemStatus.n8n?.status === 'connected' ? 'var(--rama-green)' : '#ea580c',
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
            background: 'var(--bg-main)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Cpu size={14} color="var(--rama-green)" />
          <span style={{ color: 'var(--text-secondary)' }}>Groq AI:</span>
          <span style={{ fontWeight: 700, color: systemStatus.groq_ai?.healthy ? 'var(--rama-green)' : '#dc2626' }}>
            {systemStatus.groq_ai?.has_api_key ? 'LLAMA-3.3' : 'ONLINE'}
          </span>
          <span
            className="status-dot"
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: 'var(--rama-green)',
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
            background: 'var(--bg-main)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Database size={14} color="var(--peacock-primary)" />
          <span style={{ color: 'var(--text-secondary)' }}>MongoDB:</span>
          <span style={{ fontWeight: 700, color: 'var(--rama-green)' }}>
            {systemStatus.mongodb?.status === 'connected' ? 'CONNECTED' : 'LOCAL'}
          </span>
          <span
            className="status-dot"
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: 'var(--rama-green)',
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
            color: 'var(--peacock-deep)',
            background: 'var(--peacock-bg)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #bae6fd',
            fontWeight: 600,
          }}
        >
          <Clock size={13} color="var(--peacock-primary)" />
          <span>{currentTime}</span>
        </div>

        {/* User Identity */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '12px',
            borderLeft: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--rama-bg)',
              border: '1px solid #99f6e4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--rama-deep)',
            }}
          >
            <User size={16} />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--peacock-deep)' }}>
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
