import React from 'react';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
import { CubeLogo } from './CubeLogo';
import { 
  Workflow, 
  Cpu, 
  Database, 
  Bell, 
  ChevronDown, 
  AlertTriangle 
} from 'lucide-react';

export function Header() {
  const { systemStatus } = useSystem();
  const { user } = useAuth();

  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        position: 'sticky',
        top: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      }}
    >
      {/* 1. Left Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <CubeLogo size={36} />
        <div>
          <h1
            className="heading-cursive-multicolor"
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              letterSpacing: '0.02em',
              lineHeight: 1.15,
            }}
          >
            RescueFlow AI
          </h1>

          <p
            style={{
              fontSize: '0.70rem',
              color: '#64748b',
              fontWeight: 500,
              marginTop: '1px',
            }}
          >
            Disaster Message Prioritization & Response Automation
          </p>
        </div>
      </div>

      {/* 2. Center Simulation Mode Active Badge */}
      <div
        style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '9999px',
          padding: '4px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 1px 2px rgba(16, 185, 129, 0.05)',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
          }}
        >
          <Bell size={11} fill="#ffffff" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: '#065f46',
              letterSpacing: '0.04em',
            }}
          >
            SIMULATION MODE ACTIVE
          </span>
          <span
            style={{
              fontSize: '0.64rem',
              color: '#047857',
              fontWeight: 500,
            }}
          >
            Automated responses and dispatches are simulated for Hackathon Evaluation
          </span>
        </div>
      </div>

      {/* 3. Right Status Badges & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* n8n Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.74rem',
            background: '#f8fafc',
            padding: '5px 12px',
            borderRadius: '9999px',
            border: '1px solid #e2e8f0',
            color: '#1e293b',
            fontWeight: 700,
          }}
        >
          <Workflow size={13} color="#0d9488" />
          <span style={{ color: '#475569', fontWeight: 600 }}>n8n</span>
          <span style={{ color: '#0d9488' }}>READY</span>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block',
            }}
          />
        </div>

        {/* Groq AI Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.74rem',
            background: '#f8fafc',
            padding: '5px 12px',
            borderRadius: '9999px',
            border: '1px solid #e2e8f0',
            color: '#1e293b',
            fontWeight: 700,
          }}
        >
          <Cpu size={13} color="#0d9488" />
          <span style={{ color: '#475569', fontWeight: 600 }}>Groq AI</span>
          <span style={{ color: '#0d9488' }}>ONLINE</span>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block',
            }}
          />
        </div>

        {/* MongoDB Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.74rem',
            background: '#f8fafc',
            padding: '5px 12px',
            borderRadius: '9999px',
            border: '1px solid #e2e8f0',
            color: '#1e293b',
            fontWeight: 700,
          }}
        >
          <Database size={13} color="#0d9488" />
          <span style={{ color: '#475569', fontWeight: 600 }}>MongoDB</span>
          <span style={{ color: '#0d9488' }}>LOCAL</span>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'inline-block',
            }}
          />
        </div>

        {/* Notification Bell with red dot */}
        <div
          style={{
            position: 'relative',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
          }}
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: '1px solid #ffffff',
            }}
          />
        </div>

        {/* User Profile Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '6px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.78rem',
            }}
          >
            SC
          </div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a' }}>
              Sarah Connor
            </div>
            <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 500 }}>
              Operations Commander
            </div>
          </div>
          <ChevronDown size={14} color="#94a3b8" />
        </div>
      </div>
    </header>
  );
}

export default Header;
