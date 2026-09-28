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
  Server, 
  SlidersHorizontal,
  Flame
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
      badgeColor: '#ef4444' 
    },
    { 
      to: '/approvals', 
      label: 'Approval Center', 
      icon: <CheckSquare size={18} />, 
      badge: stats.pending_approvals > 0 ? stats.pending_approvals : null,
      badgeColor: '#f59e0b'
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
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div
          style={{
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
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
              fontWeight: 500,
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
              transition: 'all 0.15s ease',
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '12px',
                  background: item.badgeColor ? `${item.badgeColor}22` : 'rgba(255,255,255,0.1)',
                  color: item.badgeColor || '#ffffff',
                  border: `1px solid ${item.badgeColor || '#ffffff'}44`,
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
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '12px',
          marginTop: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Incident Triage
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            {stats.total_incidents} Active
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
            <span style={{ fontWeight: 700 }}>{stats.critical}</span> Critical
          </div>
          <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(249, 115, 22, 0.3)', color: '#f97316' }}>
            <span style={{ fontWeight: 700 }}>{stats.high}</span> High
          </div>
          <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(234, 179, 8, 0.3)', color: '#eab308' }}>
            <span style={{ fontWeight: 700 }}>{stats.medium}</span> Med
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981' }}>
            <span style={{ fontWeight: 700 }}>{stats.resolved}</span> Resolved
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
