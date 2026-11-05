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

  // Clean, non-congested title & subtitle for the profile pill
  const rawName = (user?.name || 'Commander').trim();
  const rawRole = (user?.role || 'Operations').trim();
  const isDuplicate = rawName.toLowerCase() === rawRole.toLowerCase();

  // If name is long generic "Operations Commander", clean to "Commander"
  const formattedName = isDuplicate && rawName.toLowerCase().includes('operations commander')
    ? 'Commander'
    : rawName;

  const formattedSubtitle = isDuplicate
    ? (user?.callsign || user?.badge || 'HQ Command')
    : rawRole;

  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1100,
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

      {/* 2. Center Live Operations Active Badge */}
      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '9999px',
          padding: '5px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          boxShadow: '0 1px 3px rgba(16, 185, 129, 0.08)',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#16a34a',
            boxShadow: '0 0 8px #16a34a',
            flexShrink: 0,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.2 }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#166534',
              letterSpacing: '0.02em',
            }}
          >
            LIVE OPERATIONS ACTIVE
          </span>
          <span style={{ color: '#86efac' }}>&bull;</span>
          <span
            style={{
              fontSize: '0.68rem',
              color: '#15803d',
              fontWeight: 600,
            }}
          >
            Real-Time Emergency Telemetry & Dispatch Pipeline Connected
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
              padding: '3px 9px 3px 5px',
              borderRadius: '12px',
              background: isProfileOpen ? '#f1f5f9' : '#f8fafc',
              border: `1px solid ${isProfileOpen ? '#94a3b8' : '#e2e8f0'}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isProfileOpen ? '#f1f5f9' : '#f8fafc';
              e.currentTarget.style.borderColor = isProfileOpen ? '#94a3b8' : '#e2e8f0';
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0077b6 0%, #0d9488 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.78rem',
                boxShadow: '0 2px 5px rgba(0, 119, 182, 0.20)',
                overflow: 'hidden',
                border: '1.5px solid #ffffff',
                flexShrink: 0,
              }}
            >
              {(user?.photo || (typeof window !== 'undefined' ? localStorage.getItem('rescueflow_user_photo') : null)) ? (
                <img
                  src={user?.photo || localStorage.getItem('rescueflow_user_photo')}
                  alt={user?.name || 'Operator'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0, maxWidth: '125px' }}>
              <div 
                style={{ 
                  fontSize: '0.76rem', 
                  fontWeight: 700, 
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.25,
                }}
                title={user?.name}
              >
                {formattedName}
              </div>
              <div 
                style={{ 
                  fontSize: '0.64rem', 
                  color: '#64748b', 
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2,
                  marginTop: '1px'
                }}
                title={formattedSubtitle}
              >
                {formattedSubtitle}
              </div>
            </div>
            <ChevronDown size={13} color="#64748b" style={{ flexShrink: 0 }} />
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
