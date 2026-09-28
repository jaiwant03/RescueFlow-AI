import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
import { CubeLogo } from './CubeLogo';
import { NotificationPanel } from './NotificationPanel';
import { UserProfileMenu } from './UserProfileMenu';
import { EditProfileModal } from './EditProfileModal';
import { 
  Workflow, 
  Cpu, 
  Database, 
  Bell, 
  ChevronDown 
} from 'lucide-react';

export function Header() {
  const { systemStatus, unreadCount, bellRinging } = useSystem();
  const { user } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'OP';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

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

        {/* Interactive Notification Bell with Unread Badge & Sound Tone */}
        <div style={{ position: 'relative' }}>
          <button
            id="navbar-notification-btn"
            onClick={() => {
              setIsNotificationOpen(prev => !prev);
              setIsProfileOpen(false);
            }}
            title="Emergency Notifications & Dispatch Alerts"
            className={bellRinging ? 'bell-ringing' : ''}
            style={{
              position: 'relative',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isNotificationOpen ? '#0d9488' : '#475569',
              background: isNotificationOpen ? '#f0fdfa' : '#f8fafc',
              border: `1px solid ${isNotificationOpen ? '#99f6e4' : '#e2e8f0'}`,
              borderRadius: '10px',
              boxShadow: isNotificationOpen ? '0 0 0 3px rgba(13, 148, 136, 0.15)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="pulse-badge"
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  borderRadius: '9999px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Modeled Notification Panel */}
          <NotificationPanel
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        </div>

        {/* Interactive User Profile Avatar & Dropdown Menu */}
        <div style={{ position: 'relative' }}>
          <button
            id="navbar-user-profile-btn"
            onClick={() => {
              setIsProfileOpen(prev => !prev);
              setIsNotificationOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px 4px 6px',
              borderRadius: '12px',
              background: isProfileOpen ? '#f8fafc' : 'transparent',
              border: `1px solid ${isProfileOpen ? '#cbd5e1' : 'transparent'}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0077b6 0%, #0d9488 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.80rem',
                boxShadow: '0 2px 6px rgba(0, 119, 182, 0.25)',
                overflow: 'hidden',
                border: '1.5px solid #ffffff',
                flexShrink: 0,
              }}
            >
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <div style={{ lineHeight: 1.15, textAlign: 'left' }}>
              <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a' }}>
                {user?.name || 'Sarah Connor'}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 500 }}>
                {user?.role || 'Operations Commander'}
              </div>
            </div>
            <ChevronDown size={14} color="#94a3b8" />
          </button>

          {/* User Profile Menu */}
          <UserProfileMenu
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            onOpenEditProfile={() => {
              setIsProfileOpen(false);
              setIsEditProfileOpen(true);
            }}
          />

          {/* Edit Profile Modal */}
          <EditProfileModal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
