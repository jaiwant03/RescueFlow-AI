import React from 'react';
import { Clock, CheckCircle2, ShieldCheck, Activity, Eye, XCircle, Archive } from 'lucide-react';

export function StatusBadge({ status }) {
  const st = (status || 'pending').toLowerCase();

  const config = {
    pending: {
      label: 'PENDING',
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
      border: '1px solid rgba(245, 158, 11, 0.35)',
      icon: <Clock size={12} />,
    },
    approved: {
      label: 'APPROVED',
      bg: 'rgba(59, 130, 246, 0.15)',
      color: '#3b82f6',
      border: '1px solid rgba(59, 130, 246, 0.35)',
      icon: <ShieldCheck size={12} />,
    },
    responding: {
      label: 'RESPONDING',
      bg: 'rgba(139, 92, 246, 0.15)',
      color: '#a78bfa',
      border: '1px solid rgba(139, 92, 246, 0.35)',
      icon: <Activity size={12} />,
    },
    monitoring: {
      label: 'MONITORING',
      bg: 'rgba(6, 182, 212, 0.15)',
      color: '#06b6d4',
      border: '1px solid rgba(6, 182, 212, 0.35)',
      icon: <Eye size={12} />,
    },
    resolved: {
      label: 'RESOLVED',
      bg: 'rgba(16, 185, 129, 0.15)',
      color: '#10b981',
      border: '1px solid rgba(16, 185, 129, 0.35)',
      icon: <CheckCircle2 size={12} />,
    },
    rejected: {
      label: 'REJECTED',
      bg: 'rgba(100, 116, 139, 0.15)',
      color: '#94a3b8',
      border: '1px solid rgba(100, 116, 139, 0.35)',
      icon: <XCircle size={12} />,
    },
    archived: {
      label: 'ARCHIVED',
      bg: 'rgba(71, 85, 105, 0.15)',
      color: '#64748b',
      border: '1px solid rgba(71, 85, 105, 0.35)',
      icon: <Archive size={12} />,
    },
  };

  const item = config[st] || config.pending;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: '9999px',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        background: item.bg,
        color: item.color,
        border: item.border,
      }}
    >
      {item.icon}
      <span>{item.label}</span>
    </span>
  );
}

export default StatusBadge;
