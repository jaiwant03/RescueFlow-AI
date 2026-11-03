import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { ModeledSelect } from '../components/ModeledSelect';
import { CubeLogo } from '../components/CubeLogo';
import { 
  Shield, 
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

  // Login form state - clean, real-time (no hardcoded demo pre-fills)
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 20%, #ffffff 0%, #f0fdfa 45%, #e2e8f0 100%)',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Subtle Gradient Accents */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '10%',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '10%',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Clean Card Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.10), 0 2px 6px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Top Gradient Accent Stripe */}
        <div
          style={{
            height: '4px',
            width: '100%',
            background: 'linear-gradient(90deg, #0d9488 0%, #0284c7 50%, #6366f1 100%)',
          }}
        />

        <div style={{ padding: '32px 30px 26px' }}>
          {/* Header Brand */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '10px' }}>
              <CubeLogo size={42} />
            </div>

            <h1
              className="heading-cursive-multicolor"
              style={{
                fontSize: '1.95rem',
                fontWeight: 800,
                letterSpacing: '0.02em',
                lineHeight: 1.15,
                margin: '0 auto',
                display: 'block',
              }}
            >
              RescueFlow AI
            </h1>

            <p
              style={{
                fontSize: '0.78rem',
                color: '#64748b',
                fontWeight: 500,
                marginTop: '4px',
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
                padding: '3px 12px',
                borderRadius: '9999px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#065f46',
                letterSpacing: '0.03em',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <span>LIVE EMERGENCY OPERATIONS PORTAL</span>
            </div>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: '12px',
              padding: '4px',
              marginBottom: '20px',
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
              <KeyRound size={14} />
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
              <User size={14} />
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
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
                  Official Email or Username
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. operator@rescueflow.ai"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
                  Security Passcode
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter security passcode..."
                    style={{
                      width: '100%',
                      padding: '10px 38px 10px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
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
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
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
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Remember terminal</span>
                </label>
                <span
                  style={{ color: '#0d9488', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => addToast('Credential Information', 'Enter your assigned operator passcode, or create a new account.', 'info')}
                >
                  Passcode Help?
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(15, 118, 110, 0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  opacity: isSubmitting ? 0.8 : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Authenticating Terminal...</span>
                  </>
                ) : (
                  <>
                    <span>Launch Tactical Console</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
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

          {/* MODE 2: SIGN UP */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '5px', color: '#1e293b' }}>
                  Operator Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Enter your full name..."
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '5px', color: '#1e293b' }}>
                  Tactical Official Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="Enter your official email..."
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '5px', color: '#1e293b' }}>
                  Agency / Responding Department
                </label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={signupDepartment}
                    onChange={(e) => setSignupDepartment(e.target.value)}
                    placeholder="e.g. Disaster Operations Team"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '5px', color: '#1e293b' }}>
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
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '5px', color: '#1e293b' }}>
                    Create Passcode
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Passcode"
                      style={{
                        width: '100%',
                        padding: '9px 10px 9px 32px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        color: '#0f172a',
                        outline: 'none',
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '5px', color: '#1e293b' }}>
                    Confirm Passcode
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Confirm"
                      style={{
                        width: '100%',
                        padding: '9px 10px 9px 32px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        color: '#0f172a',
                        outline: 'none',
                      }}
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
                  marginTop: '4px',
                  fontSize: '0.74rem',
                  color: '#475569',
                  cursor: 'pointer',
                  lineHeight: 1.35,
                }}
              >
                <input
                  type="checkbox"
                  checked={agreeTacticalTerms}
                  onChange={(e) => setAgreeTacticalTerms(e.target.checked)}
                  style={{ marginTop: '2px', cursor: 'pointer' }}
                />
                <span>
                  I certify official operational clearance to access live emergency triage telemetry and dispatch automation.
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  opacity: isSubmitting ? 0.8 : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Registering Operator...</span>
                  </>
                ) : (
                  <>
                    <span>Register Operator Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
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
              marginTop: '22px',
              paddingTop: '16px',
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
            <Shield size={12} color="#0d9488" />
            <span>End-to-End Cryptographic Telemetry Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
