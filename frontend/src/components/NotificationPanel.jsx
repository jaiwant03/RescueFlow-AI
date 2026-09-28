import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystem } from '../context/SystemContext';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Volume2, 
  VolumeX, 
  Zap, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

export function NotificationPanel({ isOpen, onClose }) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAllNotifications, 
    soundEnabled, 
    toggleSound,
    sendTestNotification
  } = useSystem();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'critical' | 'approval'
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        // Check if the click was on the trigger button itself
        const bellBtn = document.getElementById('navbar-notification-btn');
        if (bellBtn && bellBtn.contains(event.target)) return;
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

  if (!isOpen) return null;

  // Filter notifications
  const filtered = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'critical') return n.priority === 'critical';
    if (activeTab === 'approval') return n.priority === 'approval';
    return true;
  });

  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Just now';
    const seconds = Math.floor((new Date() - new Date(isoString)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleItemClick = (notif) => {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      onClose();
    }
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: '52px',
        right: '12px',
        width: '420px',
        maxWidth: 'calc(100vw - 24px)',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 50px -10px rgba(0, 91, 130, 0.22), 0 0 0 1px rgba(226, 232, 240, 0.95)',
        border: '1px solid #e2e8f0',
        zIndex: 9999,
        overflow: 'hidden',
        animation: 'slideIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Modeled Top Gradient Stripe */}
      <div
        style={{
          height: '4px',
          width: '100%',
          background: 'linear-gradient(90deg, #0d9488 0%, #0077b6 50%, #8b5cf6 100%)',
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0d9488, #0077b6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)',
              }}
            >
              <Bell size={15} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                Disaster & Dispatch Alerts
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                Real-time emergency telemetry feed
              </div>
            </div>
          </div>

          {/* Quick Header Actions: Sound Toggle + Test Alert + Mark Read */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Audio chime toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
              style={{
                padding: '5px',
                borderRadius: '7px',
                background: soundEnabled ? '#ecfdf5' : '#f1f5f9',
                color: soundEnabled ? '#059669' : '#94a3b8',
                border: `1px solid ${soundEnabled ? '#a7f3d0' : '#e2e8f0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            {/* Test Alert Button */}
            <button
              onClick={sendTestNotification}
              title="Trigger a simulated real-time alert with audio chime"
              style={{
                padding: '4px 8px',
                borderRadius: '7px',
                background: '#eff6ff',
                color: '#0284c7',
                border: '1px solid #bfdbfe',
                fontSize: '0.70rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Zap size={12} /> Test Alert
            </button>

            {/* Mark All Read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                title="Mark all notifications as read"
                style={{
                  padding: '4px 8px',
                  borderRadius: '7px',
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCheck size={12} /> Read All
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'critical', label: 'Critical (P1)', count: notifications.filter(n => n.priority === 'critical').length },
            { id: 'approval', label: 'Approvals', count: notifications.filter(n => n.priority === 'approval').length },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? '#0d9488' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                      color: isActive ? '#ffffff' : '#475569',
                      padding: '1px 5px',
                      borderRadius: '9999px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div
        style={{
          maxHeight: '360px',
          overflowY: 'auto',
          padding: '8px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: '#f8fafc',
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8' }}>
            <ShieldAlert size={36} color="#cbd5e1" style={{ margin: '0 auto 8px', display: 'block' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
              No alerts in this category
            </div>
            <div style={{ fontSize: '0.74rem', marginTop: '2px' }}>
              System is operating smoothly within parameters
            </div>
          </div>
        ) : (
          filtered.map(notif => {
            const isUnread = !notif.read;
            const priorityStyles = {
              critical: {
                borderLeft: '4px solid #ef4444',
                badgeBg: '#fef2f2',
                badgeColor: '#dc2626',
                icon: AlertTriangle,
                badgeText: 'P1 CRITICAL',
              },
              high: {
                borderLeft: '4px solid #f97316',
                badgeBg: '#fff7ed',
                badgeColor: '#ea580c',
                icon: AlertTriangle,
                badgeText: 'P2 HIGH',
              },
              approval: {
                borderLeft: '4px solid #f59e0b',
                badgeBg: '#fffbeb',
                badgeColor: '#d97706',
                icon: ShieldAlert,
                badgeText: 'APPROVAL',
              },
              system: {
                borderLeft: '4px solid #0d9488',
                badgeBg: '#f0fdfa',
                badgeColor: '#0f766e',
                icon: Info,
                badgeText: 'SYSTEM',
              },
            };

            const styleCfg = priorityStyles[notif.priority] || priorityStyles.high;
            const IconComponent = styleCfg.icon;

            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                style={{
                  background: isUnread ? '#ffffff' : '#ffffff',
                  border: isUnread ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                  borderLeft: styleCfg.borderLeft,
                  borderRadius: '10px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isUnread ? '0 2px 8px rgba(0, 91, 130, 0.08)' : '0 1px 2px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: styleCfg.badgeBg,
                        color: styleCfg.badgeColor,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {styleCfg.badgeText}
                    </span>
                    {notif.category && (
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                        {notif.category}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={10} /> {formatTimeAgo(notif.timestamp)}
                    </span>
                    {isUnread && (
                      <span
                        title="Unread alert"
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: '#0284c7',
                          display: 'inline-block',
                        }}
                      />
                    )}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: isUnread ? 700 : 600,
                    color: '#0f172a',
                    lineHeight: 1.25,
                    marginBottom: '4px',
                  }}
                >
                  {notif.title}
                </div>

                <div
                  style={{
                    fontSize: '0.72rem',
                    color: '#475569',
                    lineHeight: 1.35,
                    marginBottom: '6px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {notif.message}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dashed #f1f5f9' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    View details <ChevronRight size={11} />
                  </span>

                  {isUnread && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif.id);
                      }}
                      title="Mark as read"
                      style={{
                        fontSize: '0.66rem',
                        color: '#64748b',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <Check size={11} /> Mark read
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={clearAllNotifications}
          style={{
            fontSize: '0.72rem',
            color: '#dc2626',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            padding: '4px 6px',
            borderRadius: '6px',
          }}
        >
          <Trash2 size={12} /> Clear All
        </button>

        <button
          onClick={() => {
            navigate('/incidents');
            onClose();
          }}
          style={{
            fontSize: '0.74rem',
            color: '#0f766e',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: '#ecfdf5',
            padding: '5px 12px',
            borderRadius: '8px',
            border: '1px solid #a7f3d0',
          }}
        >
          <span>Command Center</span>
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}

export default NotificationPanel;
