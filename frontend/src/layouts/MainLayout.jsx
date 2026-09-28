import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { LiveTicker } from '../components/LiveTicker';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle } from 'lucide-react';

export function MainLayout() {
  const { toasts } = useSystem();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Main Header */}
      <Header />

      {/* App Body (Sidebar + Content) */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            padding: '16px 20px',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 58px)',
            background: '#f1f5f9',
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
