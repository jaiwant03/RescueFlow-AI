import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { LiveTicker } from '../components/LiveTicker';
import { useSystem } from '../context/SystemContext';
import { AlertTriangle } from 'lucide-react';

export function MainLayout() {
  const { toasts } = useSystem();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Simulation Notice Top Ribbon */}
      <div className="simulation-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={14} color="#fef08a" />
          <span>
            <strong>SIMULATION MODE ACTIVE:</strong> RescueFlow AI is running in Hackathon Evaluation Mode. Automated responses and dispatches are simulated.
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', opacity: 0.9, fontWeight: 600 }}>
          Coimbatore District EOC Simulation Node
        </div>
      </div>

      {/* Main Header */}
      <Header />

      {/* Live Activity Ticker */}
      <LiveTicker />

      {/* App Body (Sidebar + Content) */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 105px)',
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Floating Notification Toasts */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 99999,
          maxWidth: '380px',
        }}
      >
        {toasts.map((toast) => {
          const borderColors = {
            critical: '#dc2626',
            warning: '#ea580c',
            info: 'var(--rama-green)',
          };
          const bColor = borderColors[toast.type] || 'var(--peacock-primary)';

          return (
            <div
              key={toast.id}
              style={{
                background: '#ffffff',
                borderLeft: `4px solid ${bColor}`,
                borderTop: '1px solid var(--border-subtle)',
                borderRight: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-lg)',
                color: 'var(--text-primary)',
                animation: 'slideIn 0.2s ease',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '2px', color: bColor }}>
                {toast.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {toast.message}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MainLayout;
