import React from 'react';
import { NavLink } from 'react-router-dom';
import { LandscapeArtwork } from './LandscapeArtwork';
import { 
  Home, 
  Radio, 
  ShieldCheck, 
  Send, 
  Activity, 
  BarChart3, 
  FileText, 
  Database 
} from 'lucide-react';

export function Sidebar() {
  const navItems = [
    { to: '/', label: 'Command Center', icon: <Home size={17} /> },
    { to: '/incidents', label: 'Live Incidents', icon: <Radio size={17} /> },
    { to: '/approvals', label: 'Approval Center', icon: <ShieldCheck size={17} /> },
    { to: '/report', label: 'Emergency Report', icon: <Send size={17} /> },
    { to: '/activity', label: 'Response Activity', icon: <Activity size={17} /> },
    { to: '/analytics', label: 'Analytics', icon: <BarChart3 size={17} /> },
    { to: '/audit', label: 'Audit Logs', icon: <FileText size={17} /> },
    { to: '/status', label: 'System & n8n Status', icon: <Database size={17} /> },
  ];

  return (
    <aside
      style={{
        width: '215px',
        minWidth: '215px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 10px 0 10px',
        minHeight: 'calc(100vh - 61px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '9px 14px',
              borderRadius: '9999px',
              fontSize: '0.84rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0f766e' : '#475569',
              background: isActive ? '#e6f9f5' : 'transparent',
              transition: 'all 0.15s ease',
            })}
          >
            <span style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>
              {item.icon}
            </span>
            <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Pine Mountain Illustration & Motto */}
      <div
        style={{
          position: 'relative',
          width: 'calc(100% + 20px)',
          marginLeft: '-10px',
          marginTop: 'auto',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '110px' }}>
          <LandscapeArtwork width="100%" height="110px" opacity={0.9} />
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '0',
              right: '0',
              textAlign: 'center',
              color: '#0f766e',
              fontSize: '0.74rem',
              fontWeight: 700,
              lineHeight: 1.25,
              textShadow: '0 1px 2px rgba(255,255,255,0.9)',
              letterSpacing: '0.01em',
            }}
          >
            <div>Safer Communities</div>
            <div>Stronger Tomorrow</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
