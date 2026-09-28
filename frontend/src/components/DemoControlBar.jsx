import React, { useState } from 'react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  CheckCircle, 
  Layers, 
  Flame, 
  HeartHandshake, 
  MessageSquareOff,
  Radio,
  Loader2
} from 'lucide-react';

export function DemoControlBar({ onScenarioComplete }) {
  const { addToast, refreshStats } = useSystem();
  const [runningKey, setRunningKey] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [processingModal, setProcessingModal] = useState(null);

  const scenarios = [
    {
      key: 'step1_flood_psg',
      stepNum: '1',
      title: 'Flood @ PSG',
      subtitle: '5 trapped (Telegram)',
      color: '#ef4444',
      icon: <Radio size={14} />,
    },
    {
      key: 'step2_flood_psg_corroborate',
      stepNum: '2',
      title: 'Corroborate #2',
      subtitle: 'Water in homes (Email)',
      color: '#f97316',
      icon: <Layers size={14} />,
    },
    {
      key: 'step3_flood_psg_web',
      stepNum: '3',
      title: 'Corroborate #3',
      subtitle: '3 Reports Merged (Web)',
      color: '#06b6d4',
      icon: <Layers size={14} />,
    },
    {
      key: 'step4_fire_gandhipuram',
      stepNum: '4',
      title: 'Fire @ Gandhipuram',
      subtitle: 'Building trapped (Telegram)',
      color: '#f43f5e',
      icon: <Flame size={14} />,
    },
    {
      key: 'step5_medical_rspuram',
      stepNum: '5',
      title: 'Medical @ RS Puram',
      subtitle: 'Elderly assistance (Web)',
      color: '#eab308',
      icon: <HeartHandshake size={14} />,
    },
    {
      key: 'step6_non_emergency',
      stepNum: '6',
      title: 'Casual Message',
      subtitle: 'Greeting (Filtered Out)',
      color: '#64748b',
      icon: <MessageSquareOff size={14} />,
    },
  ];

  const processingSteps = [
    'Receiving simulated report from channel...',
    'Groq AI classifying emergency vs casual...',
    'Extracting location, people affected & resources...',
    'Running deduplication check against active incidents...',
    'Calculating deterministic priority score & reasons...',
    'Updating MongoDB & dispatching realtime dashboard event!'
  ];

  const handleRunScenario = async (sc) => {
    setRunningKey(sc.key);
    setProcessingModal({
      scenario: sc,
      currentStepIndex: 0
    });

    // Animate through processing steps for realistic AI orchestration visual
    for (let i = 0; i < processingSteps.length - 1; i++) {
      setActiveStep(i);
      setProcessingModal(prev => prev ? { ...prev, currentStepIndex: i } : null);
      await new Promise(r => setTimeout(r, 220));
    }

    try {
      const res = await api.runDemoScenario(sc.key);
      setActiveStep(processingSteps.length - 1);
      setProcessingModal(prev => prev ? { ...prev, currentStepIndex: processingSteps.length - 1 } : null);
      
      await new Promise(r => setTimeout(r, 350));
      setProcessingModal(null);
      setRunningKey(null);

      const status = res.pipeline_result?.status;
      const incId = res.pipeline_result?.incident_id;

      if (status === 'merged') {
        addToast(
          'Deduplication Corroborated',
          `Report merged into ${incId}! Report count is now ${res.pipeline_result.report_count}`,
          'info'
        );
      } else if (status === 'created') {
        addToast(
          'Incident Created',
          `Created incident ${incId} (${res.pipeline_result.incident.type.toUpperCase()}) with priority score ${res.pipeline_result.incident.priority_score}`,
          'critical'
        );
      } else if (status === 'non_emergency') {
        addToast('Non-Emergency Filtered', 'Casual message detected and safely archived.', 'info');
      }

      refreshStats();
      if (onScenarioComplete) onScenarioComplete(res);
    } catch (err) {
      console.error('Error running scenario:', err);
      setProcessingModal(null);
      setRunningKey(null);
      addToast('Simulation Error', err.response?.data?.detail || err.message, 'warning');
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all demo data (incidents, messages, approvals) to a clean state?')) {
      try {
        await api.resetDemoData();
        addToast('Demo Reset', 'All demo data wiped clean.', 'info');
        refreshStats();
        if (onScenarioComplete) onScenarioComplete(null);
      } catch (err) {
        addToast('Reset Error', err.message, 'warning');
      }
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #111a2f 0%, #0d1527 100%)',
        border: '1px solid var(--border-medium)',
        borderRadius: '12px',
        padding: '12px 18px',
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.04em' }}>
            HACKATHON DEMO SIMULATION CONTROLLER
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            (1-Click trigger for official scenario flow)
          </span>
        </div>

        <button
          onClick={handleReset}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 10px', height: '28px', color: '#94a3b8' }}
          title="Reset database to initial zero state"
        >
          <RotateCcw size={12} /> Reset Demo Data
        </button>
      </div>

      {/* Scenario Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '8px',
        }}
      >
        {scenarios.map((sc) => {
          const isRunning = runningKey === sc.key;
          return (
            <button
              key={sc.key}
              onClick={() => handleRunScenario(sc)}
              disabled={Boolean(runningKey)}
              style={{
                background: isRunning ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-surface)',
                border: `1px solid ${isRunning ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                borderRadius: '8px',
                padding: '8px 10px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: runningKey ? 'not-allowed' : 'pointer',
                opacity: runningKey && !isRunning ? 0.5 : 1,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!runningKey) e.currentTarget.style.borderColor = sc.color;
              }}
              onMouseLeave={(e) => {
                if (!runningKey) e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: `${sc.color}22`,
                  color: sc.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {isRunning ? <Loader2 size={14} className="animate-spin" /> : sc.stepNum}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sc.title}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sc.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* AI Processing Stepper Overlay Modal */}
      {processingModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(5, 10, 20, 0.85)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: '14px',
              padding: '24px 30px',
              width: '90%',
              maxWidth: '460px',
              boxShadow: '0 0 35px rgba(6, 182, 212, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Loader2 size={22} color="var(--accent-cyan)" style={{ animation: 'spin 1s linear infinite' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 700 }}>
                  RescueFlow AI Orchestration
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Executing {processingModal.scenario.title} ({processingModal.scenario.subtitle})
                </p>
              </div>
            </div>

            {/* Stepper items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              {processingSteps.map((step, idx) => {
                const isDone = processingModal.currentStepIndex > idx;
                const isCurrent = processingModal.currentStepIndex === idx;

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.82rem',
                      color: isDone ? '#10b981' : isCurrent ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: isCurrent ? 600 : 400,
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: isDone ? '1px solid #10b981' : isCurrent ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                        background: isDone ? 'rgba(16, 185, 129, 0.2)' : isCurrent ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        flexShrink: 0,
                      }}
                    >
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DemoControlBar;
