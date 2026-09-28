import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useRealtime } from '../hooks/useRealtime';

const SystemContext = createContext(null);

// Audio Alert Synthesizer via Web Audio API (Zero external mp3 files needed)
export const playAlertTone = (type = 'critical') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    if (type === 'critical') {
      // High urgency dual chime (880Hz -> 1174Hz)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(1174, ctx.currentTime + 0.14);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(587, ctx.currentTime + 0.14);
    } else {
      // Pleasant alert chime (587Hz -> 880Hz)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(293.66, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12);
    }

    gainNode.gain.setValueAtTime(0.14, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.40);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.40);
    osc2.stop(ctx.currentTime + 0.40);
  } catch (e) {
    console.warn('Audio tone play skipped:', e);
  }
};

const SEED_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'P1 CRITICAL: Flash Flood Barrier Breach',
    message: 'Ward 7 drainage surge exceeded 4.2ft. 48 residents reported stranded. Watercraft dispatch required.',
    priority: 'critical',
    type: 'incident',
    category: 'Flood',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    read: false,
    link: '/incidents',
    incidentId: 'INC-2026-001',
  },
  {
    id: 'notif-2',
    title: 'APPROVAL REQUIRED: Heavy Rescue Squad Dispatch',
    message: 'Tactical deployment request pending for NDRF Team Charlie to Sector 4 structural collapse.',
    priority: 'approval',
    type: 'approval',
    category: 'Rescue',
    timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    read: false,
    link: '/approvals',
    incidentId: 'INC-2026-004',
  },
  {
    id: 'notif-3',
    title: 'P2 HIGH: Chemical Fume Dispersion Warning',
    message: 'Industrial containment breached near North Metro bypass. Perimeter cordon established.',
    priority: 'high',
    type: 'incident',
    category: 'Hazmat',
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    read: false,
    link: '/incidents',
    incidentId: 'INC-2026-002',
  },
  {
    id: 'notif-4',
    title: 'Automated n8n Triage Pipe Synchronized',
    message: 'Telegram and Web intake streams verified active. Groq LLaMA-3.3 prioritizing inbound signals.',
    priority: 'system',
    type: 'system',
    category: 'Telemetry',
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    read: true,
    link: '/status',
  },
];

export function SystemProvider({ children }) {
  const [systemStatus, setSystemStatus] = useState({
    backend: { status: 'checking', healthy: true },
    mongodb: { status: 'checking', healthy: true },
    groq_ai: { status: 'checking', healthy: true },
    n8n: { status: 'checking', healthy: false },
    telegram: { status: 'ready', healthy: true },
    email: { status: 'ready', healthy: true },
  });

  const [toasts, setToasts] = useState([]);
  const [stats, setStats] = useState({
    total_incidents: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    resolved: 0,
    pending_approvals: 0,
  });

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Sound enabled preference
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('rescueflow_sound_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Notifications state
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('rescueflow_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn('Failed parsing notifications from storage');
      }
    }
    return SEED_NOTIFICATIONS;
  });

  // Bell ring animation trigger
  const [bellRinging, setBellRinging] = useState(false);

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem('rescueflow_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Sync sound preference
  useEffect(() => {
    localStorage.setItem('rescueflow_sound_enabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  }, []);

  // Trigger bell shake animation
  const triggerBellRing = useCallback(() => {
    setBellRinging(true);
    setTimeout(() => setBellRinging(false), 800);
  }, []);

  // Add Notification with Sound and Optional Browser Notification
  const addNotification = useCallback((item) => {
    const notif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: item.title,
      message: item.message,
      priority: item.priority || 'high',
      type: item.type || 'incident',
      category: item.category || 'General',
      timestamp: new Date().toISOString(),
      read: false,
      link: item.link || '/incidents',
      incidentId: item.incidentId || null,
    };

    setNotifications(prev => [notif, ...prev]);
    triggerBellRing();

    // Play tone if sound enabled
    if (soundEnabled) {
      playAlertTone(notif.priority);
    }

    // Native browser notification if allowed
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notif.title, {
          body: notif.message,
          icon: '/favicon.ico',
        });
      }
    } catch (e) {
      console.warn('Native notification suppressed:', e);
    }

    return notif;
  }, [soundEnabled, triggerBellRing]);

  // Mark single notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Toggle sound chime
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  // Simulate/Test Alert Ping (User-facing feature to demonstrate the notification button working)
  const sendTestNotification = useCallback(() => {
    const testCases = [
      {
        title: '🚨 P1 CRITICAL: Flash Flood Evacuation Notice',
        message: 'Ward 12 riverbank breached. Immediate amphibious boats required for 24 stranded residents.',
        priority: 'critical',
        type: 'incident',
        category: 'Flood',
        link: '/incidents',
      },
      {
        title: '⚠️ ACTION REQUIRED: Hazmat Squad Deployment',
        message: 'Industrial chemical cloud reported near Sector 3. Requires Commander authorization.',
        priority: 'approval',
        type: 'approval',
        category: 'Hazmat',
        link: '/approvals',
      },
      {
        title: '🚒 DISPATCH UPDATE: First Responders Deployed',
        message: 'Engine Company 8 arrived at Commercial Plaza fire. Perimeter containment 65%.',
        priority: 'high',
        type: 'incident',
        category: 'Fire',
        link: '/activity',
      },
    ];

    const chosen = testCases[Math.floor(Math.random() * testCases.length)];
    addNotification(chosen);
    addToast(chosen.title, chosen.message, chosen.priority === 'critical' ? 'critical' : 'warning');
  }, [addNotification, addToast]);

  const refreshStatus = useCallback(async () => {
    try {
      const data = await api.getSystemStatus();
      if (data && data.components) {
        setSystemStatus(data.components);
      }
    } catch (err) {
      console.warn('System status check note:', err);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const data = await api.getDashboardStats();
      if (data && data.summary) {
        setStats(data.summary);
      }
    } catch (err) {
      console.warn('Dashboard stats refresh error:', err);
    }
  }, []);

  // Periodic polling fallback
  useEffect(() => {
    refreshStatus();
    refreshStats();
    const interval = setInterval(() => {
      refreshStatus();
      refreshStats();
    }, 15000);
    return () => clearInterval(interval);
  }, [refreshStatus, refreshStats]);

  // Handle live incoming events from websocket/SSE
  const handleRealtimeEvent = useCallback((event) => {
    if (!event) return;
    const { type, data } = event;

    if (type === 'INCIDENT_CREATED') {
      const isCritical = data.priority_level === 'critical';
      addToast(
        `🚨 New ${data.priority_level?.toUpperCase() || ''} Incident Detected`,
        `#${data.incident_id} (${data.type.toUpperCase()}) in ${data.location}`,
        isCritical ? 'critical' : 'warning'
      );
      addNotification({
        title: `${isCritical ? 'P1 CRITICAL' : 'P2 HIGH'}: ${data.type?.toUpperCase()} in ${data.location}`,
        message: data.summary || `Emergency report logged in ${data.location}. Requires response coordination.`,
        priority: isCritical ? 'critical' : 'high',
        type: 'incident',
        category: data.type || 'Emergency',
        link: `/incidents/${data.incident_id || ''}`,
        incidentId: data.incident_id,
      });
      refreshStats();
    } else if (type === 'INCIDENT_UPDATED') {
      addToast(
        '🔄 Incident Updated',
        `#${data.incident_id} updated: Report count is now ${data.report_count}`,
        'info'
      );
      refreshStats();
    } else if (type === 'SYSTEM_RESET') {
      addToast('🧹 System Reset', 'Operational records synchronized and reset.', 'info');
      refreshStats();
    }
  }, [addToast, addNotification, refreshStats]);

  useRealtime(handleRealtimeEvent);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SystemContext.Provider value={{
      systemStatus,
      stats,
      currentTime,
      toasts,
      notifications,
      unreadCount,
      bellRinging,
      soundEnabled,
      toggleSound,
      addToast,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAllNotifications,
      sendTestNotification,
      refreshStatus,
      refreshStats
    }}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  return useContext(SystemContext);
}
