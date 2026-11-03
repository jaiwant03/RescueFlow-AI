import React, { useState } from 'react';
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
  Loader2 
} from 'lucide-react';

export function DemoControlBar({ onScenarioComplete }) {
  const { addToast, refreshStats } = useSystem();
  const [runningKey, setRunningKey] = useState(null);
  const [runningAll, setRunningAll] = useState(false);

  // 6 Scenarios Strictly Ordered: Highest Severity (1) to Lowest Severity (6)
  // All received directly from citizen Telegram channels & bot
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
          <LandscapeArtwork width="380px" height="110px" opacity={0.55} />
        </div>
      </div>

      {/* Top Banner Row: Title + Run Demo Data Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Shield Icon in Teal Rounded Square */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)',
              flexShrink: 0,
            }}
          >
            <Shield size={20} color="#ffffff" />
          </div>
          <div>
            <h2
              className="heading-cursive-multicolor"
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '0.01em',
              }}
            >
              Real-Time Incident Ingestion & Telemetry Controller
            </h2>

            <p
              style={{
                fontSize: '0.74rem',
                color: '#64748b',
                fontWeight: 500,
                marginTop: '2px',
              }}
            >
              Live citizen emergency messages received via Telegram — prioritized from High Severity (1) to Low (6)
            </p>
          </div>
        </div>

        {/* Green "Inject All Scenarios" Pill Button */}
        <button
          onClick={handleRunAllScenarios}
          disabled={runningAll || Boolean(runningKey)}
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0077b6 100%)',
            color: '#ffffff',
            borderRadius: '9999px',
            padding: '7px 18px',
            fontSize: '0.80rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: 'none',
            cursor: runningAll || Boolean(runningKey) ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(13, 148, 136, 0.35)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!runningAll && !runningKey) {
              e.currentTarget.style.opacity = '0.92';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!runningAll && !runningKey) {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {runningAll ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Injecting Scenarios...
            </>
          ) : (
            <>
              <Play size={12} fill="#ffffff" />
              Inject All Scenarios
            </>
          )}
        </button>
      </div>

      {/* 6 Scenario Cards Row: High Severity (1) to Low Severity (6) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '10px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {scenarios.map((sc) => {
          const isRunning = runningKey === sc.key;
          return (
            <div
              key={sc.key}
              onClick={() => !runningAll && !runningKey && handleRunScenario(sc)}
              style={{
                background: isRunning ? '#f0fdfa' : '#ffffff',
                border: `1px solid ${isRunning ? '#0d9488' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: runningAll || runningKey ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isRunning ? '0 0 10px rgba(13, 148, 136, 0.25)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!runningAll && !runningKey) {
                  e.currentTarget.style.borderColor = '#0d9488';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!runningAll && !runningKey) {
                  e.currentTarget.style.borderColor = isRunning ? '#0d9488' : '#e2e8f0';
                  e.currentTarget.style.boxShadow = isRunning ? '0 0 10px rgba(13, 148, 136, 0.25)' : 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {/* Step Number Circle */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: sc.numBg,
                  color: sc.numColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {isRunning ? <Loader2 size={12} className="animate-spin" /> : sc.stepNum}
              </div>

              {/* Scenario Icon */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {sc.icon}
              </div>

              {/* Text Info */}
              <div style={{ overflow: 'hidden', lineHeight: 1.2 }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#0f2738',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {sc.title}
                </div>
                <div
                  style={{
                    fontSize: '0.66rem',
                    color: '#64748b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: '1px',
                  }}
                >
                  {sc.subtitle}
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
