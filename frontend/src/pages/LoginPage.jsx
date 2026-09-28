import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ModeledSelect } from '../components/ModeledSelect';
import { Shield, Sparkles } from 'lucide-react';

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
        background: 'radial-gradient(circle at center, #ffffff 0%, #f0fdfa 50%, #e0f2fe 100%)',
        padding: '20px',
      }}
    >
      <div
        className="eoc-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
          background: '#ffffff',
          borderRadius: '16px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'var(--gradient-peacock-rama)',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(0, 91, 130, 0.25)',
            }}
          >
            <Shield size={28} color="#ffffff" />
          </div>
          <h1 className="heading-cursive-multicolor" style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            RescueFlow AI
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
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
            background: 'var(--gradient-peacock-rama)',
            boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
          }}
        >
          <Sparkles size={16} /> Enter as Operations Commander (Demo Access)
        </button>

        <div style={{ textAlign: 'center', margin: '14px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          &mdash; OR CONFIGURE DEMO OPERATOR PROFILE &mdash;
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--peacock-deep)' }}>
              Operator Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--peacock-deep)' }}>
              Command Role
            </label>
            <ModeledSelect
              value={role}
              onChange={setRole}
              options={[
                { value: 'commander', label: 'Operations Commander (Authorizes Dispatches)', dotColor: '#0f766e' },
                { value: 'supervisor', label: 'Tactical Supervisor (Evaluates Reports)', dotColor: '#0284c7' },
                { value: 'dispatcher', label: 'Field Dispatch Officer (Observer)', dotColor: '#8b5cf6' },
              ]}
              minWidth="100%"
            />
          </div>

          <button
            type="submit"
            className="btn"
            style={{
              marginTop: '10px',
              padding: '11px',
              background: 'var(--rama-bg)',
              color: 'var(--rama-deep)',
              border: '1px solid #99f6e4',
              fontWeight: 700,
            }}
          >
            Launch Tactical Console &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
