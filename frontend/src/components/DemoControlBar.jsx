import React, { useState } from 'react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { 
  Sparkles, 
  RotateCcw, 
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
  const [processingModal, setProcessingModal] = useState(null);

  const scenarios = [
    {
      key: 'step1_flood_psg',
      stepNum: '1',
      title: 'Flood @ PSG',
      subtitle: '5 trapped (Telegram)',
      color: '#dc2626',
      icon: <Radio size={14} />,
    },
    {
      key: 'step2_flood_psg_corroborate',
      stepNum: '2',
      title: 'Corroborate #2',
      subtitle: 'Water in homes (Email)',
      color: '#ea580c',
      icon: <Layers size={14} />,
    },
    {
      key: 'step3_flood_psg_web',
      stepNum: '3',
      title: 'Corroborate #3',
      subtitle: '3 Reports Merged (Web)',
      color: '#0d9488',
      icon: <Layers size={14} />,
    },
    {
      key: 'step4_fire_gandhipuram',
      stepNum: '4',
      title: 'Fire @ Gandhipuram',
      subtitle: 'Building trapped (Telegram)',
      color: '#e11d48',
      icon: <Flame size={14} />,
    },
    {
      key: 'step5_medical_rspuram',
      stepNum: '5',
      title: 'Medical @ RS Puram',
      subtitle: 'Elderly assistance (Web)',
      color: '#d97706',
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
      currentStepIndex: 0,
    });

    const stepInterval = setInterval(() => {
      setProcessingModal((prev) => {
        if (!prev) return null;
        if (prev.currentStepIndex < processingSteps.length - 1) {
          return { ...prev, currentStepIndex: prev.currentStepIndex + 1 };
        }
        return prev;
      });
    }, 450);

    try {
      const res = await api.runScenario(sc.key);
      clearInterval(stepInterval);

      setTimeout(() => {
        setProcessingModal(null);
        setRunningKey(null);
      }, 500);

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
      clearInterval(stepInterval);
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
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)',
        border: '1px solid var(--border-medium)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--rama-green)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--peacock-deep)', letterSpacing: '0.04em' }}>
            HACKATHON DEMO SIMULATION CONTROLLER
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            (1-Click trigger for official scenario flow)
          </span>
        </div>

        <button
          onClick={handleReset}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 12px', height: '28px', color: 'var(--peacock-primary)' }}
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
          gap: '10px',
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
                background: isRunning ? 'var(--rama-bg)' : '#ffffff',
                border: `1px solid ${isRunning ? 'var(--rama-green)' : 'var(--border-subtle)'}`,
                borderRadius: '8px',
                padding: '10px 12px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: runningKey ? 'not-allowed' : 'pointer',
                opacity: runningKey && !isRunning ? 0.5 : 1,
                boxShadow: isRunning ? '0 0 12px rgba(13, 148, 136, 0.3)' : 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!runningKey) {
                  e.currentTarget.style.borderColor = 'var(--rama-green)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!runningKey) {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: `${sc.color}15`,
                  color: sc.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  border: `1px solid ${sc.color}33`,
                }}
              >
                {isRunning ? <Loader2 size={14} className="animate-spin" /> : sc.stepNum}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--peacock-deep)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sc.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
            backgroundColor: 'rgba(15, 39, 56, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '2px solid var(--rama-green)',
              borderRadius: '14px',
              padding: '24px 30px',
              width: '90%',
              maxWidth: '460px',
              boxShadow: '0 20px 50px rgba(0, 91, 130, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Loader2 size={24} color="var(--rama-green)" style={{ animation: 'spin 1s linear infinite' }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--peacock-deep)', fontWeight: 800 }}>
                  RescueFlow AI Orchestration
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
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
                      fontSize: '0.84rem',
                      color: isDone ? 'var(--rama-deep)' : isCurrent ? 'var(--peacock-deep)' : 'var(--text-muted)',
                      fontWeight: isCurrent ? 700 : isDone ? 600 : 400,
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isDone ? '1px solid var(--rama-green)' : isCurrent ? '2px solid var(--peacock-primary)' : '1px solid var(--border-medium)',
                        background: isDone ? 'var(--rama-bg)' : isCurrent ? 'var(--peacock-bg)' : 'transparent',
                        color: isDone ? 'var(--rama-deep)' : isCurrent ? 'var(--peacock-primary)' : 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.68rem',
                        fontWeight: 700,
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
