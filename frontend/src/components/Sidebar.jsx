import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSystem } from '../context/SystemContext';
import { 
  LayoutDashboard, 
  Radio, 
  CheckSquare, 
  Send, 
  Activity, 
  BarChart3, 
  ScrollText, 
  Server
} from 'lucide-react';

export function Sidebar() {
  const { stats } = useSystem();

  const navItems = [
    { to: '/', label: 'Command Center', icon: <LayoutDashboard size={18} /> },
    { 
      to: '/incidents', 
      label: 'Live Incidents', 
      icon: <Radio size={18} />, 
      badge: stats.critical > 0 ? `${stats.critical} CRIT` : null, 
      badgeColor: 'var(--priority-critical)' 
    },
    { 
      to: '/approvals', 
      label: 'Approval Center', 
      icon: <CheckSquare size={18} />, 
      badge: stats.pending_approvals > 0 ? stats.pending_approvals : null,
      badgeColor: '#ea580c'
    },
    { to: '/report', label: 'Emergency Report', icon: <Send size={18} /> },
    { to: '/activity', label: 'Response Activity', icon: <Activity size={18} /> },
    { to: '/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { to: '/audit', label: 'Audit Logs', icon: <ScrollText size={18} /> },
    { to: '/status', label: 'System & n8n Status', icon: <Server size={18} /> },
  ];

  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 12px',
        minHeight: 'calc(100vh - 61px)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--peacock-primary)',
            padding: '8px 12px 4px',
            fontWeight: 700,
          }}
        >
          Operations
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--rama-deep)' : 'var(--text-secondary)',
              background: isActive ? 'var(--rama-bg)' : 'transparent',
              borderLeft: isActive ? '4px solid var(--rama-green)' : '4px solid transparent',
              transition: 'all var(--transition-fast)',
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'inherit' }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'var(--priority-critical-bg)',
                  color: item.badgeColor || 'var(--priority-critical)',
                  border: '1px solid var(--priority-critical-border)',
                }}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Triage Quick Stats Footer */}
      <div
        style={{
          background: 'var(--bg-main)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '12px',
          marginTop: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--peacock-deep)', textTransform: 'uppercase', fontWeight: 700 }}>
            Incident Triage
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--rama-green)' }}>
            {stats.total_incidents} Active
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem' }}>
          <div style={{ background: 'var(--priority-critical-bg)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--priority-critical-border)', color: 'var(--priority-critical)' }}>
            <span style={{ fontWeight: 800 }}>{stats.critical}</span> Critical
          </div>
          <div style={{ background: 'var(--priority-high-bg)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--priority-high-border)', color: 'var(--priority-high)' }}>
            <span style={{ fontWeight: 800 }}>{stats.high}</span> High
          </div>
          <div style={{ background: 'var(--priority-medium-bg)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--priority-medium-border)', color: 'var(--priority-medium)' }}>
            <span style={{ fontWeight: 800 }}>{stats.medium}</span> Med
          </div>
          <div style={{ background: 'var(--priority-low-bg)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--priority-low-border)', color: 'var(--priority-low)' }}>
            <span style={{ fontWeight: 800 }}>{stats.resolved}</span> Done
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
