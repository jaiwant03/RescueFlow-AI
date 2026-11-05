import React from 'react';
import { Link } from 'react-router-dom';
import { LandscapeArtwork } from './LandscapeArtwork';
import { 
  Shield, 
  Waves, 
  Flame, 
  Zap, 
  Droplets, 
  MessageSquare, 
  Radio, 
  HeartPulse, 
  AlertTriangle, 
  ChevronRight 
} from 'lucide-react';

function getIncidentIcon(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('fire')) return <Flame size={15} color="#dc2626" />;
  if (t.includes('flood') || t.includes('water')) return <Waves size={15} color="#0284c7" />;
  if (t.includes('med') || t.includes('trauma')) return <HeartPulse size={15} color="#ea580c" />;
  if (t.includes('elec') || t.includes('hazard') || t.includes('wire')) return <Zap size={15} color="#d97706" />;
  if (t.includes('hazmat') || t.includes('chem')) return <AlertTriangle size={15} color="#9333ea" />;
  return <MessageSquare size={15} color="#0d9488" />;
}

export function DemoControlBar({ incidents = [] }) {
  const hasIncidents = incidents && incidents.length > 0;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '16px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Mountain/Pine Landscape on Right Side */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '320px',
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <div style={{ position: 'absolute', right: '-10px', top: '10px', width: '380px', height: '110px' }}>
          <LandscapeArtwork width="380px" height="110px" opacity={0.45} />
        </div>
      </div>

      {/* Top Banner Row: Title + Live Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Shield Icon */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: hasIncidents ? '#0d9488' : '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: hasIncidents ? '0 2px 6px rgba(13, 148, 136, 0.3)' : '0 2px 6px rgba(2, 132, 199, 0.3)',
              flexShrink: 0,
            }}
          >
            <Shield size={20} color="#ffffff" />
          </div>

          <div>
            <h2
              className="heading-cursive-multicolor"
              style={{
                fontSize: '1.20rem',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '0.01em',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Real-Time Incident Ingestion & Telemetry Controller</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#059669',
                  background: '#ecfdf5',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  border: '1px solid #a7f3d0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                BOT ACTIVE
              </span>
            </h2>

            <p
              style={{
                fontSize: '0.74rem',
                color: '#64748b',
                fontWeight: 500,
                margin: '2px 0 0',
              }}
            >
              {hasIncidents 
                ? `Live citizen emergency messages received via Telegram — prioritized from High Severity (1) to Low (6) (${incidents.length} active)`
                : 'Live citizen emergency messages received via Telegram — prioritized from High Severity (1) to Low (6)'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Persistent 6 Incident Slots: Real ingested Telegram incidents appear live, empty slots remain clean */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '10px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
          const inc = incidents[slotIdx];
          if (inc) {
            const isCrit = inc.priority_level === 'critical';
            const isHigh = inc.priority_level === 'high';
            const isMed = inc.priority_level === 'medium';
            const numBg = isCrit ? '#fee2e2' : isHigh ? '#ffedd5' : isMed ? '#fef3c7' : '#e0f2fe';
            const numColor = isCrit ? '#991b1b' : isHigh ? '#9a3412' : isMed ? '#92400e' : '#075985';
            const borderColor = isCrit ? '#fecaca' : isHigh ? '#fed7aa' : isMed ? '#fde68a' : '#cbd5e1';

            return (
              <Link
                key={inc.incident_id || slotIdx}
                to={`/incidents/${inc.incident_id}`}
                style={{
                  background: '#ffffff',
                  border: `1.5px solid ${borderColor}`,
                  borderRadius: '10px',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  minHeight: '48px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isCrit ? '#dc2626' : '#0d9488';
                  e.currentTarget.style.boxShadow = '0 3px 8px rgba(0,0,0,0.06)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = borderColor;
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Priority Rank Number */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: numBg,
                    color: numColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {slotIdx + 1}
                </div>

                {/* Incident Type Icon */}
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  {getIncidentIcon(inc.type)}
                </div>

                {/* Info Text */}
                <div style={{ overflow: 'hidden', lineHeight: 1.2, flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#0f2738',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textTransform: 'capitalize',
                    }}
                    title={`${inc.type} @ ${inc.location}`}
                  >
                    {inc.type} @ {inc.location ? inc.location.split(',')[0] : 'Scene'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.66rem',
                      color: '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '2px',
                    }}
                  >
                    {inc.people_affected ? `${inc.people_affected} affected` : 'Report logged'} &bull; {inc.priority_level?.toUpperCase() || 'NORMAL'}
                  </div>
                </div>

                <ChevronRight size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
              </Link>
            );
          }

          // Unoccupied slot: clean, empty card box
          return (
            <div
              key={`empty-${slotIdx}`}
              style={{
                background: '#f8fafc',
                border: '1.5px dashed #cbd5e1',
                borderRadius: '10px',
                padding: '9px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '48px',
              }}
            >
              {/* Muted Rank Number */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#e2e8f0',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {slotIdx + 1}
              </div>

              {/* Muted Waiting Beacon Icon */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <Radio size={14} color="#94a3b8" />
              </div>

              {/* Empty slot placeholder text */}
              <div style={{ overflow: 'hidden', lineHeight: 1.2, flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Empty Slot
                </div>
                <div
                  style={{
                    fontSize: '0.64rem',
                    color: '#94a3b8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: '2px',
                  }}
                >
                  Waiting for Telegram
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DemoControlBar;
