import React from 'react';
import { AlertCircle, AlertTriangle, Flame, CheckCircle, Info } from 'lucide-react';

export function PriorityBadge({ level, score = null }) {
  const lvl = (level || 'low').toLowerCase();

  const config = {
    critical: {
      label: 'CRITICAL',
      className: 'badge-critical',
      icon: <Flame size={13} />,
    },
    high: {
      label: 'HIGH',
      className: 'badge-high',
      icon: <AlertTriangle size={13} />,
    },
    medium: {
      label: 'MEDIUM',
      className: 'badge-medium',
      icon: <AlertCircle size={13} />,
    },
    low: {
      label: 'LOW',
      className: 'badge-low',
      icon: <CheckCircle size={13} />,
    },
  };

  const item = config[lvl] || config.low;

  return (
    <span className={`badge ${item.className}`}>
      {item.icon}
      <span>{item.label}</span>
      {score !== null && <span style={{ opacity: 0.85, fontWeight: 700, marginLeft: 2 }}>{score}</span>}
    </span>
  );
}

export default PriorityBadge;
