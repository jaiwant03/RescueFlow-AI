import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { ModeledSelect } from '../components/ModeledSelect';
import { CubeLogo } from '../components/CubeLogo';
import { 
  Shield, 
  ShieldCheck,
  Lock, 
  Mail, 
  User, 
  Building, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  Radio,
  KeyRound,
  CheckCircle2,
  Loader2,
  Zap,
  Cpu,
  Waves,
  Activity,
  Sparkles
} from 'lucide-react';

export function LoginPage({ initialMode = 'login' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { addToast } = useSystem();

  // If navigated to /signup, start in signup mode
  const isSignupRoute = location.pathname === '/signup' || initialMode === 'signup';
  const [mode, setMode] = useState(isSignupRoute ? 'signup' : 'login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('Operations Commander');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupDepartment, setSignupDepartment] = useState('National Disaster Response Force (NDRF)');
  const [signupRole, setSignupRole] = useState('Operations Commander');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [agreeTacticalTerms, setAgreeTacticalTerms] = useState(true);

  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Switch modes
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
  };

  // Handle Login Submit
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your official email or operator identifier.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your security passcode.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = login({
        email: loginEmail,
        password: loginPassword,
        overrideRole: loginRole,
      });

      setIsSubmitting(false);

      if (result.success) {
        addToast('Operator Authenticated', `Welcome to RescueFlow Console, ${result.user.name}.`, 'info');
        navigate('/');
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      }
    }, 250);
  };

  // Handle Signup Submit
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!signupName.trim()) {
      setErrorMessage('Please enter your full operator name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Please provide a valid official email address.');
      return;
    }
    if (!signupPassword) {
      setErrorMessage('Please create a security passcode.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Security passcode confirmation does not match.');
      return;
    }
    if (!agreeTacticalTerms) {
      setErrorMessage('You must confirm authorized operational clearance.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = signup({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
        department: signupDepartment,
      });

      setIsSubmitting(false);

      if (result.success) {
        addToast('Profile Activated', `Welcome to RescueFlow AI, ${result.user.name}!`, 'info');
        navigate('/');
      } else {
        setErrorMessage(result.error || 'Failed to create operator account.');
      }
    }, 300);
  };

  return (
    <div className="login-split-container">
      <style>{`
        .login-split-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
          font-family: var(--font-sans);
          background: #ffffff;
        }

        /* LEFT PANEL: TACTICAL HERO SHOWCASE */
        .login-left-panel {
          flex: 1.15;
          background: #021321;
          background-image: 
            radial-gradient(circle at 15% 20%, rgba(13, 148, 136, 0.22) 0%, transparent 45%),
            radial-gradient(circle at 85% 80%, rgba(2, 132, 199, 0.18) 0%, transparent 45%),
            radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 30px 30px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px;
          position: relative;
          overflow: hidden;
          color: #ffffff;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* Ambient Glow Orb */
        .login-glow-orb {
          position: absolute;
          top: 30%;
          left: 40%;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, transparent 70%);
          pointer-events: none;
          filter: blur(40px);
        }

        /* Interactive Telemetry Card */
        .login-telemetry-card {
          background: rgba(6, 28, 46, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(13, 148, 136, 0.35);
          border-radius: 16px;
          padding: 22px 24px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 25px rgba(13, 148, 136, 0.15);
          margin: 32px 0;
          position: relative;
          z-index: 2;
        }

        /* Pillar Feature Box */
        .login-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.2s ease;
        }
        .login-feature-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(13, 148, 136, 0.3);
          transform: translateX(3px);
        }

        /* RIGHT PANEL: AUTHENTICATION TERMINAL */
        .login-right-panel {
          flex: 1;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40px 36px;
          position: relative;
          overflow-y: auto;
        }

        .login-form-card {
          width: 100%;
          max-width: 440px;
        }

        /* Form Controls */
        .login-input {
          width: 100%;
          padding: 11px 14px 11px 40px;
          border-radius: 10px;
          border: 1.5px solid #cbd5e1;
          background: #f8fafc;
          font-size: 0.88rem;
          color: #0f172a;
          transition: all 0.18s ease;
          outline: none;
          font-family: inherit;
        }
        .login-input:focus {
          border-color: #0d9488;
          background: #ffffff;
          box-shadow: 0 0 0 3.5px rgba(13, 148, 136, 0.16);
        }
        .login-input::placeholder {
          color: #94a3b8;
        }

        .login-btn-primary {
          width: 100%;
          padding: 12px 18px;
          border-radius: 11px;
          background: linear-gradient(135deg, #0d9488 0%, #005b82 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.92rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.32);
          transition: all 0.18s ease;
          letter-spacing: 0.01em;
        }
        .login-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #14b8a6 0%, #0077b6 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(13, 148, 136, 0.40);
        }
        .login-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-btn-primary:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        /* RESPONSIVE COLLAPSE */
        @media (max-width: 1024px) {
          .login-left-panel {
            display: none;
          }
          .login-right-panel {
            flex: 1;
            background: radial-gradient(circle at 50% 15%, #ffffff 0%, #f0fdfa 50%, #e2e8f0 100%);
            padding: 32px 16px;
          }
          .login-form-card {
            background: #ffffff;
            padding: 36px 28px;
            border-radius: 20px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 20px 45px -12px rgba(15, 23, 42, 0.12);
          }
        }
      `}</style>

      {/* ============================================================ */}
      {/* 1. LEFT PANEL: HIGH-TECH EMERGENCY COMMAND SHOWCASE           */}
      {/* ============================================================ */}
      <div className="login-left-panel">
        <div className="login-glow-orb" />

        {/* Top Header Identity */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <CubeLogo size={42} />
            <div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                RescueFlow <span style={{ color: '#14b8a6' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Disaster Prioritization & Response Automation
              </div>
            </div>
          </div>
        </div>

        {/* Center Hero Proposition */}
        <div style={{ position: 'relative', zIndex: 2, margin: '20px 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(13, 148, 136, 0.16)',
              border: '1px solid rgba(20, 184, 166, 0.35)',
              fontSize: '0.70rem',
              fontWeight: 700,
              color: '#5eead4',
              marginBottom: '16px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <Radio size={12} color="#2dd4bf" />
            <span>Autonomous Emergency Intelligence Engine</span>
          </div>

          <h2
            style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              lineHeight: 1.22,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              marginBottom: '14px',
            }}
          >
            Sub-second triage when <span style={{ background: 'linear-gradient(120deg, #2dd4bf 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>every second matters.</span>
          </h2>

          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, maxWidth: '520px' }}>
            Continuous ingestion from Telegram, citizen hotlines, and web feeds. Powered by Groq Llama 3.3-70B for zero-data-loss deduplication and verified dispatch routing.
          </p>

          {/* Interactive Live Telemetry Feed Mock */}
          <div className="login-telemetry-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', color: '#fca5a5', textTransform: 'uppercase' }}>
                  Live Incident Telemetry
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                ⚡ 0.32s Latency &bull; Groq Llama 3.3
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                  Flash Flood Barrier Breach &bull; PSG Sector
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                  3 Multi-Channel Reports Corroborated (Telegram + Citizen Web)
                </div>
              </div>
              <span
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.70rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                P1 CRITICAL
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.72rem',
                color: '#5eead4',
                background: 'rgba(13, 148, 136, 0.12)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(13, 148, 136, 0.25)',
              }}
            >
              <CheckCircle2 size={14} color="#2dd4bf" />
              <span>Deduplication confidence 94.6% &bull; Dispatch packet ready for supervisor authorization</span>
            </div>
          </div>

          {/* 3 Mission Pillars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="login-feature-item">
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(13, 148, 136, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2dd4bf', flexShrink: 0 }}>
                <Zap size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9' }}>Real-Time Multi-Channel Ingest</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Immediate ingestion across Telegram bots, SMS gateways, and public emergency web forms.</div>
              </div>
            </div>

            <div className="login-feature-item">
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', flexShrink: 0 }}>
                <Cpu size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9' }}>70B Semantic Deduplication & Scoring</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Clusters related panic reports into a single consolidated master ticket without data loss.</div>
              </div>
            </div>

            <div className="login-feature-item">
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', flexShrink: 0 }}>
                <ShieldCheck size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9' }}>Human-in-the-Loop Safe Authorization</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>High-consequence dispatches are held for one-click commander review before n8n broadcast.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2dd4bf' }}>&lt; 350ms</div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Triage Latency</div>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.12)' }} />
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>99.4%</div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Priority Accuracy</div>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.12)' }} />
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a78bfa' }}>Zero Loss</div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Corroboration</div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. RIGHT PANEL: CLEAN AUTHENTICATION TERMINAL                */}
      {/* ============================================================ */}
      <div className="login-right-panel">
        <div className="login-form-card">
          {/* Mobile-only logo */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '8px' }}>
              <CubeLogo size={38} />
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a', margin: 0 }}>
              RescueFlow <span style={{ color: '#0d9488' }}>AI</span>
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              Emergency Operations Command Terminal
            </p>
          </div>

          {/* Clean Status Pill */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                fontSize: '0.70rem',
                fontWeight: 700,
                color: '#065f46',
                letterSpacing: '0.03em',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <span>OPERATIONS CLEARANCE PORTAL</span>
            </div>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: '12px',
              padding: '4px',
              marginBottom: '22px',
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '9px',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? '#0f766e' : '#64748b',
                boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <KeyRound size={15} />
              <span>Operator Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSwitch('signup')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '9px',
                fontSize: '0.82rem',
                fontWeight: 700,
                background: mode === 'signup' ? '#ffffff' : 'transparent',
                color: mode === 'signup' ? '#0284c7' : '#64748b',
                boxShadow: mode === 'signup' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <User size={15} />
              <span>Create Account</span>
            </button>
          </div>

          {/* Error Alert Banner */}
          {errorMessage && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderLeft: '4px solid #ef4444',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.78rem',
                color: '#b91c1c',
                fontWeight: 600,
              }}
            >
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MODE 1: SIGN IN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
                  Official Email or Callsign
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. operator@rescueflow.ai"
                    className="login-input"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
                  Security Passcode
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your passcode..."
                    className="login-input"
                    style={{ paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(p => !p)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                    }}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
                  Operational Clearance Role
                </label>
                <ModeledSelect
                  value={loginRole}
                  onChange={setLoginRole}
                  options={[
                    { value: 'Operations Commander', label: 'Operations Commander (Authorizes Dispatches)', dotColor: '#0f766e' },
                    { value: 'Tactical Supervisor', label: 'Tactical Supervisor (Evaluates Reports)', dotColor: '#0284c7' },
                    { value: 'Field Dispatch Officer', label: 'Field Dispatch Officer (Telemetry Observer)', dotColor: '#8b5cf6' },
                    { value: 'Emergency Responder', label: 'Emergency Responder (Field Operations)', dotColor: '#ea580c' },
                  ]}
                  minWidth="100%"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', marginTop: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#475569', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={rememberTerminal}
                    onChange={(e) => setRememberTerminal(e.target.checked)}
                    style={{ cursor: 'pointer', accentColor: '#0d9488' }}
                  />
                  <span>Remember this terminal</span>
                </label>
                <span
                  style={{ color: '#0d9488', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => addToast('Credential Information', 'Enter your assigned operator passcode, or create an account for immediate clearance.', 'info')}
                >
                  Need assistance?
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="login-btn-primary"
                style={{ marginTop: '6px' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Authenticating Clearance...</span>
                  </>
                ) : (
                  <>
                    <span>Launch Tactical Console</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Need a new operational clearance?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('signup')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0d9488',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Create Account
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* MODE 2: SIGN UP */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '5px', color: '#1e293b' }}>
                  Operator Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Captain David Chen"
                    className="login-input"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '5px', color: '#1e293b' }}>
                  Official Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="e.g. dchen@disaster-response.gov"
                    className="login-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '5px', color: '#1e293b' }}>
                  Agency / Responding Department
                </label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={signupDepartment}
                    onChange={(e) => setSignupDepartment(e.target.value)}
                    placeholder="e.g. Disaster Response Force"
                    className="login-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '5px', color: '#1e293b' }}>
                  Designated Tactical Role
                </label>
                <ModeledSelect
                  value={signupRole}
                  onChange={setSignupRole}
                  options={[
                    { value: 'Operations Commander', label: 'Operations Commander (Full Dispatch Authority)', dotColor: '#0f766e' },
                    { value: 'Tactical Supervisor', label: 'Tactical Supervisor (Incident Evaluation)', dotColor: '#0284c7' },
                    { value: 'Field Dispatch Officer', label: 'Field Dispatch Officer (Fleet Coordination)', dotColor: '#8b5cf6' },
                    { value: 'Emergency Responder Lead', label: 'Emergency Responder Lead (Ground Units)', dotColor: '#ea580c' },
                  ]}
                  minWidth="100%"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '5px', color: '#1e293b' }}>
                    Create Passcode
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Passcode"
                      className="login-input"
                      style={{ paddingLeft: '34px' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '5px', color: '#1e293b' }}>
                    Confirm Passcode
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Confirm"
                      className="login-input"
                      style={{ paddingLeft: '34px' }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(p => !p)}
                  style={{ color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showSignupPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showSignupPassword ? 'Hide Passcodes' : 'Show Passcodes'}</span>
                </button>
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginTop: '2px',
                  fontSize: '0.74rem',
                  color: '#475569',
                  cursor: 'pointer',
                  lineHeight: 1.4,
                }}
              >
                <input
                  type="checkbox"
                  checked={agreeTacticalTerms}
                  onChange={(e) => setAgreeTacticalTerms(e.target.checked)}
                  style={{ marginTop: '2px', cursor: 'pointer', accentColor: '#0d9488' }}
                />
                <span>
                  I certify official operational clearance to access live emergency triage telemetry and automated dispatch systems.
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="login-btn-primary"
                style={{ marginTop: '6px' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Registering Operator...</span>
                  </>
                ) : (
                  <>
                    <span>Register Clearance Profile</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284c7',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Sign In
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* Card Footer Security Assurance */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              color: '#94a3b8',
              fontWeight: 500,
            }}
          >
            <Shield size={13} color="#0d9488" />
            <span>256-Bit Cryptographic Telemetry Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
