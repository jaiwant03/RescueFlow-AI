import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { LandscapeArtwork } from './LandscapeArtwork';
import { 
  Shield, 
  Play, 
  Waves, 
  Flame, 
  Plus, 
  Zap, 
  Droplets, 
  MessageSquare, 
  Loader2,
  Trash2,
  Send,
  Radio,
  HeartPulse,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Sparkles
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

export function DemoControlBar({ incidents = [], onScenarioComplete, onResetComplete }) {
  const { addToast, refreshStats } = useSystem();
  const [runningKey, setRunningKey] = useState(null);
  const [runningAll, setRunningAll] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showSimOptions, setShowSimOptions] = useState(false);

  // 6 Scenarios for testing / evaluator demonstration
  const scenarios = [
    {
      key: 'step1_fire_gandhipuram',
      stepNum: '1',
      numBg: '#fee2e2',
      numColor: '#991b1b',
      title: 'Fire @ Gandhipuram',
      subtitle: '8 trapped (Telegram)',
      severityLabel: 'P1 CRITICAL',
      icon: <Flame size={15} color="#dc2626" />,
    },
    {
      key: 'step2_flood_peelamedu',
      stepNum: '2',
      numBg: '#ffedd5',
      numColor: '#9a3412',
      title: 'Flood @ Peelamedu',
      subtitle: 'Water surge 5ft (Telegram)',
      severityLabel: 'P1 CRITICAL',
      icon: <Waves size={15} color="#ea580c" />,
    },
    {
      key: 'step3_medical_rspuram',
      stepNum: '3',
      numBg: '#fef3c7',
      numColor: '#92400e',
      title: 'Medical @ RS Puram',
      subtitle: 'Head trauma (Telegram)',
      severityLabel: 'P2 HIGH',
      icon: (
        <div style={{ width: '15px', height: '15px', background: '#d97706', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={11} color="#ffffff" strokeWidth={3} />
        </div>
      ),
    },
    {
      key: 'step4_hazard_townhall',
      stepNum: '4',
      numBg: '#e0f2fe',
      numColor: '#075985',
      title: 'Hazard @ Town Hall',
      subtitle: 'Live wire down (Telegram)',
      severityLabel: 'P3 MEDIUM',
      icon: <Zap size={15} color="#0284c7" />,
    },
    {
      key: 'step5_waterlogging_ukkadam',
      stepNum: '5',
      numBg: '#dcfce7',
      numColor: '#166534',
      title: 'Waterlogging @ Ukkadam',
      subtitle: 'Road flooded (Telegram)',
      severityLabel: 'P4 LOW',
      icon: <Droplets size={15} color="#0d9488" />,
    },
    {
      key: 'step6_casual_query',
      stepNum: '6',
      numBg: '#f1f5f9',
      numColor: '#475569',
      title: 'Casual Message',
      subtitle: 'Filtered Out (Telegram)',
      severityLabel: 'P5 FILTERED',
      icon: <MessageSquare size={15} color="#64748b" />,
    },
  ];

  const handleRunScenario = async (sc) => {
    setRunningKey(sc.key);
    try {
      const res = await api.runDemoScenario(sc.key);
      addToast(
        `✓ ${sc.title}`,
        res.note || 'Telegram message received & triaged in real time.',
        sc.key === 'step6_casual_query' || sc.key === 'step6_non_emergency' ? 'info' : 'critical'
      );
      if (onScenarioComplete) onScenarioComplete();
      refreshStats();
    } catch (err) {
      addToast('Scenario Notice', err.response?.data?.detail || err.message, 'warning');
    } finally {
      setRunningKey(null);
    }
  };

  const handleRunAllScenarios = async () => {
    setRunningAll(true);
    for (const sc of scenarios) {
      setRunningKey(sc.key);
      try {
        await api.runDemoScenario(sc.key);
        if (onScenarioComplete) onScenarioComplete();
        refreshStats();
      } catch (err) {
        // continue
      }
      await new Promise(r => setTimeout(r, 600));
    }
    setRunningKey(null);
    setRunningAll(false);
    addToast('All Telegram Scenarios Processed', 'Priority ranking 1 (Critical) to 6 (Low/Filtered) ingested into dispatch queue.', 'info');
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await api.resetDemoData();
      addToast('Database Wiped Clean', 'All incidents, messages, and dispatch tasks removed. Listening for Telegram messages.', 'info');
      refreshStats();
      if (onResetComplete) onResetComplete();
      if (onScenarioComplete) onScenarioComplete();
    } catch (err) {
      addToast('Reset Notice', err.response?.data?.detail || err.message, 'warning');
    } finally {
      setIsClearing(false);
    }
  };

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

      {/* Top Banner Row: Title + Status + Action Controls */}
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
          {/* Shield Icon with live status pulse */}
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

        {/* Action Controls: Clear Database + Telegram Bot + Sim Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Telegram Bot Link */}
          <a
            href="https://t.me/RescueFlowAI_DemoBot"
            target="_blank"
            rel="noreferrer"
            style={{
              background: '#f0f9ff',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '0.76rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Send size={12} /> @RescueFlowAI_DemoBot
          </a>

          {/* Clear Database (Wipe Clean) Button */}
          <button
            onClick={handleClearData}
            disabled={isClearing}
            title="Wipe all incidents and messages to start from a 100% clean state"
            style={{
              background: '#fff1f2',
              color: '#e11d48',
              border: '1px solid #fecdd3',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '0.76rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: isClearing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffe4e6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff1f2';
            }}
          >
            {isClearing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            Clear Database
          </button>

          {/* Toggle Simulation Scenarios */}
          <button
            onClick={() => setShowSimOptions(prev => !prev)}
            style={{
              background: showSimOptions ? '#f1f5f9' : 'transparent',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '9999px',
              padding: '6px 12px',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Sparkles size={12} color="#0d9488" />
            {showSimOptions ? 'Hide Test Scenarios' : 'Test Scenarios'}
          </button>
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
                {/* Step / Priority Rank */}
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
                    {inc.type} @ {inc.location?.split(',')[0]}
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

      {/* 3. Optional Simulation Test Buttons (Shown if toggled) */}
      {showSimOptions && (
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Test Telemetry Scenarios (Inject synthetic Telegram distress calls):
            </span>
            <button
              onClick={handleRunAllScenarios}
              disabled={runningAll || Boolean(runningKey)}
              style={{
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 12px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: runningAll ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {runningAll ? <Loader2 size={11} className="animate-spin" /> : <Play size={10} fill="#ffffff" />}
              Inject All 6 Test Calls
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '8px',
            }}
          >
            {scenarios.map((sc) => {
              const isRunning = runningKey === sc.key;
              return (
                <div
                  key={sc.key}
                  onClick={() => !runningAll && !runningKey && handleRunScenario(sc)}
                  style={{
                    background: isRunning ? '#f0fdfa' : '#f8fafc',
                    border: `1px solid ${isRunning ? '#0d9488' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '6px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: runningAll || runningKey ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: sc.numBg,
                      color: sc.numColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {isRunning ? <Loader2 size={10} className="animate-spin" /> : sc.stepNum}
                  </div>
                  <div style={{ flexShrink: 0 }}>{sc.icon}</div>
                  <div style={{ overflow: 'hidden', lineHeight: 1.15 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f2738', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sc.title}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sc.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DemoControlBar;
