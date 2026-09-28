import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { ModeledSelect } from '../components/ModeledSelect';
import { CubeLogo } from '../components/CubeLogo';
import { 
  Shield, 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  Building, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Radio,
  KeyRound
} from 'lucide-react';

export function LoginPage({ initialMode = 'login' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup, user: currentUser } = useAuth();
  const { addToast } = useSystem();

  // If navigated to /signup, start in signup mode
  const isSignupRoute = location.pathname === '/signup' || initialMode === 'signup';
  const [mode, setMode] = useState(isSignupRoute ? 'signup' : 'login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('commander@rescueflow.ai');
  const [loginPassword, setLoginPassword] = useState('admin');
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
  const [agreeTacticalTerms, setAgreeTacticalTerms] = useState(false);

  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Switch modes
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
  };

  // 1-Click Fast Commander Access
  const handleQuickCommanderAccess = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const res = login({
        name: 'Sarah Connor',
        role: 'Operations Commander',
        department: 'Disaster Operations Command (HQ)',
        callsign: 'COMMAND-1',
        badge: 'EOC-7701',
      });
      setIsSubmitting(false);
      if (res.success) {
        addToast('Tactical Terminal Authenticated', 'Welcome back, Commander Sarah Connor.', 'info');
        navigate('/');
      }
    }, 200);
  };

  // Quick Preset Selection
  const applyPreset = (name, email, role, callsign, badge) => {
    setLoginEmail(email);
    setLoginRole(role);
    setLoginPassword('admin');
    setErrorMessage('');
  };

  // Handle Login Submit
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const result = login({
        email: loginEmail,
        password: loginPassword,
        overrideRole: loginRole,
      });

      setIsSubmitting(false);

      if (result.success) {
        addToast('Session Established', `Welcome back, ${result.user.name}.`, 'info');
        navigate('/');
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
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
      setErrorMessage('Please provide a valid tactical email address.');
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
        addToast('Account Registered & Activated', `Welcome to RescueFlow AI, ${result.user.name}!`, 'info');
        navigate('/');
      } else {
        setErrorMessage(result.error || 'Failed to create tactical account.');
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
        background: 'radial-gradient(circle at 50% 25%, #ffffff 0%, #f0fdfa 45%, #e0f2fe 100%)',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Mesh Gradients */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '15%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 119, 182, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Modeled Card Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '490px',
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 24px 50px -12px rgba(0, 91, 130, 0.18), 0 0 0 1px rgba(226, 232, 240, 0.95)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Top Gradient Accent Stripe */}
        <div
          style={{
            height: '5px',
            width: '100%',
            background: 'linear-gradient(90deg, #0d9488 0%, #0077b6 50%, #8b5cf6 100%)',
          }}
        />

        <div style={{ padding: '32px 32px 28px' }}>
          {/* Header Brand */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '10px' }}>
              <CubeLogo size={42} />
            </div>

            <h1
              className="heading-cursive-multicolor"
              style={{
                fontSize: '2.05rem',
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
              <Radio size={12} color="#059669" />
              <span>TACTICAL EMERGENCY COMMAND TERMINAL</span>
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
            <div>
              {/* 1-Click Fast Commander Access */}
              <button
                type="button"
                onClick={handleQuickCommanderAccess}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0077b6 100%)',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  letterSpacing: '0.01em',
                  transition: 'all 0.15s ease',
                }}
              >
                <Sparkles size={17} />
                <span>Enter as Operations Commander (Sarah Connor)</span>
              </button>

              {/* Quick Operator Presets */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', textAlign: 'center' }}>
                  Quick Operator Clearance Presets
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {[
                    { name: 'Sarah Connor', email: 'commander@rescueflow.ai', role: 'Operations Commander', label: 'Commander', color: '#0d9488' },
                    { name: 'Alex Miller', email: 'supervisor@rescueflow.ai', role: 'Tactical Supervisor', label: 'Supervisor', color: '#0284c7' },
                    { name: 'Maya Lin', email: 'dispatcher@rescueflow.ai', role: 'Field Dispatch Officer', label: 'Dispatcher', color: '#8b5cf6' },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p.name, p.email, p.role)}
                      style={{
                        padding: '6px 4px',
                        borderRadius: '8px',
                        background: loginEmail === p.email ? '#ecfdf5' : '#f8fafc',
                        border: `1px solid ${loginEmail === p.email ? '#99f6e4' : '#e2e8f0'}`,
                        color: loginEmail === p.email ? '#0f766e' : '#475569',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0', color: '#94a3b8' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span style={{ padding: '0 12px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', color: '#94a3b8' }}>
                  OR SIGN IN WITH CREDENTIALS
                </span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
                    Tactical Identifier or Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. commander@rescueflow.ai"
                      style={{ width: '100%', paddingLeft: '38px', borderRadius: '10px' }}
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
                      style={{ width: '100%', paddingLeft: '38px', paddingRight: '38px', borderRadius: '10px' }}
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
                        padding: 0,
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
                  <span style={{ color: '#0d9488', fontWeight: 600, cursor: 'pointer' }} onClick={() => addToast('Bypass Code', 'Use default passcode "admin" for evaluation.', 'info')}>
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
                    fontSize: '0.90rem',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{isSubmitting ? 'Authenticating Terminal...' : 'Launch Tactical Console'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
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
                    placeholder="e.g. Captain David Chen"
                    style={{ width: '100%', paddingLeft: '38px', borderRadius: '10px' }}
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
                    placeholder="e.g. dchen@disaster-response.gov"
                    style={{ width: '100%', paddingLeft: '38px', borderRadius: '10px' }}
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
                    placeholder="e.g. National Disaster Response Force (NDRF)"
                    style={{ width: '100%', paddingLeft: '38px', borderRadius: '10px' }}
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
                    { value: 'First Responder Lead', label: 'First Responder Lead (Ground Unit Lead)', dotColor: '#ea580c' },
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
                      style={{ width: '100%', paddingLeft: '32px', borderRadius: '10px' }}
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
                      style={{ width: '100%', paddingLeft: '32px', borderRadius: '10px' }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(p => !p)}
                  style={{ color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
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
                  marginTop: '10px',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.90rem',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{isSubmitting ? 'Registering Operator...' : 'Register Operator Account &rarr;'}</span>
              </button>
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
