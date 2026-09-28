import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useRealtime } from '../hooks/useRealtime';

const SystemContext = createContext(null);

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

  // Handle live incoming events
  const handleRealtimeEvent = useCallback((event) => {
    if (!event) return;
    const { type, data } = event;

    if (type === 'INCIDENT_CREATED') {
      addToast(
        '🚨 New Incident Detected',
        `#${data.incident_id} (${data.type.toUpperCase()}) in ${data.location} [Priority: ${data.priority_level.toUpperCase()}]`,
        data.priority_level === 'critical' ? 'critical' : 'warning'
      );
      refreshStats();
    } else if (type === 'INCIDENT_UPDATED') {
      addToast(
        '🔄 Incident Updated',
        `#${data.incident_id} updated: Report count is now ${data.report_count}`,
        'info'
      );
      refreshStats();
    } else if (type === 'SYSTEM_RESET') {
      addToast('🧹 System Reset', 'Demo data cleared successfully.', 'info');
      refreshStats();
    }
  }, [addToast, refreshStats]);

  useRealtime(handleRealtimeEvent);

  return (
    <SystemContext.Provider value={{
      systemStatus,
      stats,
      currentTime,
      toasts,
      addToast,
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
