import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('commander');
  const [name, setName] = useState('Sarah Connor');

  const handleLogin = (e) => {
    e.preventDefault();
    login({
      name: name.trim() || 'Duty Commander',
      role: role === 'commander' ? 'Operations Commander' : role === 'supervisor' ? 'Tactical Supervisor' : 'Dispatch Officer',
      callsign: role === 'commander' ? 'COMMAND-1' : 'ALPHA-2',
      badge: `EOC-${Math.floor(1000 + Math.random() * 9000)}`
    });
    navigate('/');
  };

  const handleQuickDemoAccess = () => {
    login({
      name: 'Sarah Connor',
      role: 'Operations Commander',
      callsign: 'COMMAND-1',
      badge: 'EOC-7701'
    });
    navigate('/');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #0f172a 0%, #060a12 100%)',
        padding: '20px',
      }}
    >
      <div
        className="eoc-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '32px',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
              margin: '0 auto 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
            }}
          >
            <Shield size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.04em' }}>
            RESCUEFLOW <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Disaster Message Prioritization & Response Automation
          </p>
        </div>

        {/* 1-Click Demo Bypass Button */}
        <button
          onClick={handleQuickDemoAccess}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '0.92rem',
            fontWeight: 700,
            marginBottom: '20px',
            background: 'linear-gradient(90deg, #0284c7 0%, #0ea5e9 100%)',
            boxShadow: '0 0 15px rgba(2, 132, 199, 0.4)',
          }}
        >
          <Sparkles size={16} /> Enter as Operations Commander (Demo Access)
        </button>

        <div style={{ textAlign: 'center', margin: '14px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          &mdash; OR CONFIGURE DEMO OPERATOR PROFILE &mdash;
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Operator Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Command Role:
            </label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%' }}>
              <option value="commander">Operations Commander (Full Authorization)</option>
              <option value="supervisor">Tactical Supervisor</option>
              <option value="operator">Emergency Dispatch Operator</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '6px', padding: '10px' }}
          >
            Launch Session <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
