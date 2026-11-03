import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { ModeledSelect } from '../components/ModeledSelect';
import { CubeLogo } from '../components/CubeLogo';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  KeyRound,
  Loader2
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

  // Signup form state - clean, modern, empty by default
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupDepartment, setSignupDepartment] = useState('');
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
      setErrorMessage('Please enter your official email or username.');
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

  // Handle Signup Submit - streamlined, modern
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!signupName.trim()) {
      setErrorMessage('Please enter your full name.');
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
    if (signupPassword.length < 4) {
      setErrorMessage('Security passcode must be at least 4 characters.');
      return;
    }
    if (!agreeTacticalTerms) {
      setErrorMessage('Please accept the operational access terms.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = signup({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
        department: signupDepartment || 'Disaster Operations Command',
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.28) 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', 'Outfit', -apple-system, sans-serif",
      }}
    >
      {/* Ambient Diffused Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.12) 0%, transparent 65%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: '460px',
          height: '460px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.12) 0%, transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Modern Glass Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          borderRadius: '22px',
          border: '1px solid rgba(226, 232, 240, 0.95)',
          boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.09), 0 2px 8px rgba(0, 0, 0, 0.02)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Sleek Top Accent Stripe */}
        <div
          style={{
            height: '3.5px',
            width: '100%',
            background: 'linear-gradient(90deg, #0d9488 0%, #0284c7 50%, #6366f1 100%)',
          }}
        />

        <div style={{ padding: '32px 28px 24px' }}>
          {/* Header Brand */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                borderRadius: '15px',
                background: 'linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)',
                border: '1.5px solid rgba(13, 148, 136, 0.22)',
                boxShadow: '0 8px 24px -4px rgba(13, 148, 136, 0.18), 0 2px 6px rgba(0, 0, 0, 0.03)',
                marginBottom: '10px',
              }}
            >
              <CubeLogo size={30} />
            </div>

            <h1
              className="brand-title-modern"
              style={{
                fontSize: '1.80rem',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                margin: '0 auto',
                color: '#0f172a',
              }}
            >
              RescueFlow <span className="brand-gradient-text">AI</span>
            </h1>

            <p
              style={{
                fontSize: '0.78rem',
                color: '#64748b',
                fontWeight: 500,
                marginTop: '4px',
                letterSpacing: '-0.01em',
              }}
            >
              Disaster Message Prioritization & Response Automation
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '10px',
                padding: '3px 10px',
                borderRadius: '9999px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#166534',
                letterSpacing: '0.01em',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                }}
              />
              <span>Live Emergency Operations Network</span>
            </div>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: '12px',
              padding: '3.5px',
              marginBottom: '18px',
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '9px',
                fontSize: '0.80rem',
                fontWeight: 700,
                background: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? '#0f172a' : '#64748b',
                boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <KeyRound size={14} color={mode === 'login' ? '#0d9488' : '#94a3b8'} />
              <span>Operator Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSwitch('signup')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '9px',
                fontSize: '0.80rem',
                fontWeight: 700,
                background: mode === 'signup' ? '#ffffff' : 'transparent',
                color: mode === 'signup' ? '#0f172a' : '#64748b',
                boxShadow: mode === 'signup' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <User size={14} color={mode === 'signup' ? '#0284c7' : '#94a3b8'} />
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
                marginBottom: '16px',
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
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '6px', color: '#334155', letterSpacing: '-0.01em' }}>
                  Official Email or Username
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. operator@rescueflow.ai"
                    autoFocus
                    className="modern-input"
                    style={{ paddingLeft: '38px', paddingRight: '12px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '6px', color: '#334155', letterSpacing: '-0.01em' }}>
                  Security Passcode
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter security passcode..."
                    className="modern-input"
                    style={{ paddingLeft: '38px', paddingRight: '38px' }}
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
                    title={showLoginPassword ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '6px', color: '#334155', letterSpacing: '-0.01em' }}>
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

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#475569', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={rememberTerminal}
                    onChange={(e) => setRememberTerminal(e.target.checked)}
                    style={{ cursor: 'pointer', accentColor: '#0d9488' }}
                  />
                  <span>Keep me signed in</span>
                </label>
                <span
                  style={{ color: '#0d9488', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => addToast('Access Help', 'Sign in with your assigned credentials or create a profile for instant clearance.', 'info')}
                >
                  Need help?
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="modern-btn-primary"
                style={{
                  width: '100%',
                  marginTop: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.8 : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Console</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Need a new operator profile?{' '}
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

          {/* MODE 2: SIGN UP - MODERN, STREAMLINED, UNCLUTTERED */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Captain David Chen"
                    autoFocus
                    className="modern-input"
                    style={{ paddingLeft: '38px', paddingRight: '12px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
                  Official Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="e.g. david.chen@response.gov"
                    className="modern-input"
                    style={{ paddingLeft: '38px', paddingRight: '12px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
                  Agency / Department
                </label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={signupDepartment}
                    onChange={(e) => setSignupDepartment(e.target.value)}
                    placeholder="e.g. Fire & Rescue, EMS, Coastal Guard"
                    className="modern-input"
                    style={{ paddingLeft: '38px', paddingRight: '12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
                  Operational Role
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

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
                  Security Passcode
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a secure passcode..."
                    className="modern-input"
                    style={{ paddingLeft: '38px', paddingRight: '38px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(p => !p)}
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
                    title={showSignupPassword ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '2px',
                  fontSize: '0.74rem',
                  color: '#475569',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={agreeTacticalTerms}
                  onChange={(e) => setAgreeTacticalTerms(e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: '#0d9488' }}
                />
                <span>
                  I agree to authorized operational terms & access policy
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="modern-btn-primary"
                style={{
                  width: '100%',
                  marginTop: '4px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.8 : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Create Operator Profile</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
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

          {/* Card Footer */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '14px',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.70rem',
              color: '#94a3b8',
              fontWeight: 500,
            }}
          >
            <ShieldCheck size={14} color="#0d9488" />
            <span>256-Bit Encrypted Telemetry &bull; Dispatch Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
