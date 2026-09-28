import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { 
  LogOut, 
  Shield, 
  CheckCircle, 
  Activity, 
  FileText, 
  Layers, 
  UserCheck, 
  ExternalLink 
} from 'lucide-react';

export function UserProfileMenu({ isOpen, onClose }) {
  const { user, logout, switchRole } = useAuth();
  const { addToast } = useSystem();
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        const profileBtn = document.getElementById('navbar-user-profile-btn');
        if (profileBtn && profileBtn.contains(event.target)) return;
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const getInitials = (name) => {
    if (!name) return 'OP';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    onClose();
    logout();
    addToast('Tactical Session Terminated', `Operator ${user.name} logged out.`, 'info');
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: '52px',
        right: '24px',
        width: '290px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 48px -10px rgba(0, 91, 130, 0.20), 0 0 0 1px rgba(226, 232, 240, 0.95)',
        border: '1px solid #e2e8f0',
        zIndex: 9999,
        overflow: 'hidden',
        animation: 'slideIn 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Top Gradient Accent */}
      <div
        style={{
          height: '4px',
          width: '100%',
          background: 'linear-gradient(90deg, #0d9488 0%, #0077b6 50%, #8b5cf6 100%)',
        }}
      />

      {/* User Header */}
      <div
        style={{
          padding: '16px',
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0077b6 0%, #0d9488 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(0, 119, 182, 0.25)',
              flexShrink: 0,
            }}
          >
            {getInitials(user.name)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
              Callsign: <span style={{ color: '#0d9488' }}>{user.callsign || 'COMMAND-1'}</span> &bull; {user.badge || 'EOC-7701'}
            </div>
          </div>
        </div>

        {/* Role Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            fontSize: '0.70rem',
            fontWeight: 700,
            color: '#065f46',
          }}
        >
          <Shield size={11} color="#059669" />
          <span>{user.role}</span>
        </div>
      </div>

      {/* Role Switcher */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
        <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
          Tactical Clearance Level
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          {[
            { label: 'Commander', role: 'Operations Commander' },
            { label: 'Supervisor', role: 'Tactical Supervisor' },
            { label: 'Dispatcher', role: 'Field Dispatch Officer' },
          ].map((r) => {
            const isActive = user.role === r.role;
            return (
              <button
                key={r.label}
                onClick={() => switchRole(r.role)}
                style={{
                  padding: '5px 2px',
                  borderRadius: '6px',
                  fontSize: '0.66rem',
                  fontWeight: isActive ? 800 : 600,
                  background: isActive ? '#0d9488' : '#ffffff',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: isActive ? '1px solid #0d9488' : '1px solid #e2e8f0',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {[
          { label: 'Tactical Dashboard', icon: Layers, path: '/' },
          { label: 'Live Incident Queue', icon: Shield, path: '/incidents' },
          { label: 'Approval Decisions', icon: CheckCircle, path: '/approvals' },
          { label: 'Audit Trail Records', icon: FileText, path: '/audit' },
          { label: 'Subsystem Health & n8n', icon: Activity, path: '/status' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => handleNavigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#334155',
                textAlign: 'left',
                background: 'transparent',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#0f766e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#334155';
              }}
            >
              <Icon size={14} color="#64748b" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Logout Action */}
      <div style={{ padding: '8px', borderTop: '1px solid #f1f5f9', background: '#ffffff' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '9px 12px',
            borderRadius: '9px',
            fontSize: '0.80rem',
            fontWeight: 700,
            color: '#dc2626',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#dc2626';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fef2f2';
            e.currentTarget.style.color = '#dc2626';
            e.currentTarget.style.borderColor = '#fecaca';
          }}
        >
          <LogOut size={14} />
          <span>Sign Out / Log Out</span>
        </button>
      </div>
    </div>
  );
}

export default UserProfileMenu;
