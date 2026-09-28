import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { LogOut, Shield, UserCog } from 'lucide-react';

export function UserProfileMenu({ isOpen, onClose, onOpenEditProfile }) {
  const { user, logout } = useAuth();
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
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    onClose();
    logout();
    addToast('Tactical Session Terminated', `Operator ${user.name} logged out.`, 'info');
    navigate('/login');
  };

  const handleEditProfile = () => {
    onClose();
    if (onOpenEditProfile) {
      onOpenEditProfile();
    }
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: '52px',
        right: '24px',
        width: '300px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 48px -10px rgba(0, 91, 130, 0.22), 0 0 0 1px rgba(226, 232, 240, 0.95)',
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

      {/* User Header Summary */}
      <div
        style={{
          padding: '16px',
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          {/* Avatar displaying uploaded photo or fallback initials */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0077b6 0%, #0d9488 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.96rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(0, 119, 182, 0.25)',
              flexShrink: 0,
              overflow: 'hidden',
              border: '2px solid #ffffff',
            }}
          >
            {user.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              getInitials(user.name)
            )}
          </div>

          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div
              style={{
                fontSize: '0.94rem',
                fontWeight: 800,
                color: '#0f172a',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {user.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
              Callsign: <span style={{ color: '#0d9488', fontWeight: 700 }}>{user.callsign || 'COMMAND-1'}</span> &bull; {user.badge || 'EOC-7701'}
            </div>
          </div>
        </div>

        {/* Role Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
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

      {/* Menu Actions: ONLY Edit Profile and Sign Out / Log Out */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#ffffff' }}>
        {/* Edit Profile Button */}
        <button
          id="btn-edit-profile"
          onClick={handleEditProfile}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '9px',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: '#0f766e',
            background: '#f0fdfa',
            border: '1px solid #99f6e4',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 2px rgba(13, 148, 136, 0.08)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0d9488';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = '#0d9488';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f0fdfa';
            e.currentTarget.style.color = '#0f766e';
            e.currentTarget.style.borderColor = '#99f6e4';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(13, 148, 136, 0.08)';
          }}
        >
          <UserCog size={16} />
          <span>Edit Profile</span>
        </button>

        {/* Sign Out / Log Out Button */}
        <button
          id="btn-logout"
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '9px',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: '#dc2626',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#dc2626';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = '#dc2626';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fef2f2';
            e.currentTarget.style.color = '#dc2626';
            e.currentTarget.style.borderColor = '#fecaca';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <LogOut size={16} />
          <span>Sign Out / Log Out</span>
        </button>
      </div>
    </div>
  );
}

export default UserProfileMenu;
