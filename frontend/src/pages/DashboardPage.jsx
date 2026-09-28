import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { DemoControlBar } from '../components/DemoControlBar';
import { IncidentMap } from '../components/IncidentMap';
import { ApprovalModal } from '../components/ApprovalModal';
import { PriorityBadge } from '../components/PriorityBadge';
import { Link } from 'react-router-dom';
import { 
  BarChart2,
  AlertTriangle, 
  Clock, 
  Layers, 
  CheckCircle,
  MapPin, 
  ChevronDown, 
  Check, 
  Maximize2,
  Cpu, 
  Workflow, 
  Database, 
  ShieldCheck, 
  ChevronRight,
  Crosshair,
  Hourglass,
  Cog
} from 'lucide-react';

// Subtle smooth sparkline curve matching the screenshot cards
function Sparkline({ color = '#0d9488' }) {
  return (
    <svg width="44" height="20" viewBox="0 0 44 20" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M2 15 Q12 19 20 10 T32 7 T42 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />
      <path
        d="M2 15 Q12 19 20 10 T32 7 T42 3 L42 20 L2 20 Z"
        fill={color}
        fillOpacity="0.10"
      />
    </svg>
  );
}

export function DashboardPage() {
  const { stats, refreshStats } = useSystem();
  const [incidents, setIncidents] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [selectedIncidentForApproval, setSelectedIncidentForApproval] = useState(null);
  const [approvalAction, setApprovalAction] = useState('approve');
  const [district, setDistrict] = useState('Coimbatore District');
  const [currentTimeStr, setCurrentTimeStr] = useState('08:48 PM');

  const loadData = useCallback(async () => {
    try {
      const [incRes, appRes] = await Promise.all([
        api.getIncidents({ limit: 25 }),
        api.getApprovals('pending')
      ]);
      setIncidents(incRes.incidents || []);
      setApprovals(appRes.approvals || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Format current time like 08:48 PM
    const now = new Date();
    const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    setCurrentTimeStr(formatted);
  }, [loadData]);

  const handleOpenApproval = (incident, action) => {
    setSelectedIncidentForApproval(incident);
    setApprovalAction(action);
  };

  const handleConfirmApproval = async (reason) => {
    if (!selectedIncidentForApproval) return;
    const incId = selectedIncidentForApproval.incident_id;
    if (approvalAction === 'approve') {
      await api.approveIncident(incId, reason);
    } else {
      await api.rejectIncident(incId, reason);
    }
    loadData();
    refreshStats();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Hackathon Demo Simulation Controller Hero Banner */}
      <DemoControlBar onScenarioComplete={loadData} />

      {/* 2. Top 6 Operations Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '12px',
        }}
      >
        {/* Total Incidents */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#f0fdfa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart2 size={16} color="#0d9488" />
            </div>
            <Sparkline color="#0d9488" />
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>
              TOTAL INCIDENTS
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f2738', margin: '2px 0 2px' }}>
              {stats.total_incidents || 0}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>
              Active & triage tracking
            </div>
          </div>
        </div>

        {/* Critical */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={16} color="#dc2626" />
            </div>
            <Sparkline color="#dc2626" />
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>
              CRITICAL
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#dc2626', margin: '2px 0 2px' }}>
              {stats.critical || 0}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 600 }}>
              Immediate life danger
            </div>
          </div>
        </div>

        {/* High */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={16} color="#ea580c" />
            </div>
            <Sparkline color="#ea580c" />
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>
              HIGH
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ea580c', margin: '2px 0 2px' }}>
              {stats.high || 0}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#ea580c', fontWeight: 600 }}>
              High-consequence response
            </div>
          </div>
        </div>

        {/* Medium */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#fffbeb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={16} color="#d97706" />
            </div>
            <Sparkline color="#d97706" />
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>
              MEDIUM
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#d97706', margin: '2px 0 2px' }}>
              {stats.medium || 0}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>
              Controlled triage
            </div>
          </div>
        </div>

        {/* Dedup Savings */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#f0fdfa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={16} color="#0d9488" />
            </div>
            <Sparkline color="#0d9488" />
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>
              DEDUP SAVINGS
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0d9488', margin: '2px 0 2px' }}>
              {stats.deduplication_saved || 0}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>
              Fragmented reports merged
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#f0f9ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle size={16} color="#0284c7" />
            </div>
            <Sparkline color="#0284c7" />
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#475569', letterSpacing: '0.04em' }}>
              RESOLVED
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0284c7', margin: '2px 0 2px' }}>
              {stats.resolved || 0}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>
              Completed operations
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid (Map on Left, Authorizations & Principles on Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '16px' }}>
        {/* Left: Tactical Disaster Geo-Operations Map Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Map Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#f0fdfa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={15} color="#0d9488" />
              </div>
              <span className="heading-cursive-multicolor" style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                Tactical Disaster Geo-Operations Map
              </span>

            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Coimbatore District Dropdown */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#0f766e',
                  background: '#f0fdfa',
                  border: '1px solid #ccfbf1',
                  borderRadius: '9999px',
                  padding: '3px 10px',
                  cursor: 'pointer',
                }}
              >
                <MapPin size={12} color="#0d9488" />
                <span>{district}</span>
                <ChevronDown size={12} color="#0f766e" />
              </div>

              {/* Last Updated Timestamp */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#64748b' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span>Last updated: {currentTimeStr}</span>
              </div>
            </div>
          </div>

          {/* Interactive Leaflet Map with Markers and Controls */}
          <div style={{ position: 'relative', height: '360px', borderRadius: '10px', overflow: 'hidden' }}>
            <IncidentMap incidents={incidents} height="360px" />

            {/* View Full Map button in bottom right overlay */}
            <Link
              to="/incidents"
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#0f2738',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                zIndex: 1000,
              }}
            >
              <Maximize2 size={12} />
              View Full Map
            </Link>
          </div>
        </div>

        {/* Right Column: Pending Authorizations & Orchestration Principles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card 1: Pending Human Authorizations */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '14px 18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              minHeight: '170px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '10px',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hourglass size={16} color="#0d9488" />
                <span className="heading-cursive-multicolor" style={{ fontSize: '1.12rem', fontWeight: 800 }}>
                  Pending Human Authorizations
                </span>

              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: approvals.length > 0 ? '#ea580c' : '#059669',
                }}
              >
                {approvals.length} REQUIRED
              </span>
            </div>

            {approvals.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 0',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    marginBottom: '8px',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <Check size={24} strokeWidth={3} />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                  All high-priority incidents authorized or none pending.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {approvals.slice(0, 2).map((app) => (
                  <div
                    key={app.approval_id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem', color: '#0f2738' }}>
                        {app.incident_id}
                      </span>
                      <PriorityBadge level={app.priority_level} score={app.priority_score} />
                    </div>
                    <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f2738', marginBottom: '6px' }}>
                      {app.disaster_type?.toUpperCase()} — {app.location}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenApproval({ incident_id: app.incident_id, ...app }, 'approve')}
                        style={{
                          flex: 1,
                          padding: '5px 10px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: '#0d9488',
                          color: '#ffffff',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Approve Response
                      </button>
                      <button
                        onClick={() => handleOpenApproval({ incident_id: app.incident_id, ...app }, 'reject')}
                        style={{
                          padding: '5px 10px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: '#ffffff',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Orchestration Pipeline Principles */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '14px 18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '10px',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cog size={16} color="#0d9488" />
                <span className="heading-cursive-multicolor" style={{ fontSize: '1.12rem', fontWeight: 800 }}>
                  Orchestration Pipeline Principles
                </span>

              </div>
              <Link
                to="/status"
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                View Details &rarr;
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Row 1: AI Understands */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Cpu size={16} color="#0284c7" />
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0284c7', marginRight: '8px' }}>
                      AI UNDERSTANDS
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Groq LLM extracts needs, disaster type & location
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} color="#94a3b8" />
              </div>

              {/* Row 2: n8n Automates */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Workflow size={16} color="#0d9488" />
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0d9488', marginRight: '8px' }}>
                      n8n AUTOMATES
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Central workflows coordinate intake & notifications
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} color="#94a3b8" />
              </div>

              {/* Row 3: MongoDB Remembers */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Database size={16} color="#10b981" />
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#10b981', marginRight: '8px' }}>
                      MONGODB REMEMBERS
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Corroborating reports merge without data loss
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} color="#94a3b8" />
              </div>

              {/* Row 4: Human Approves */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={16} color="#3b82f6" />
                  <div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#3b82f6', marginRight: '8px' }}>
                      HUMAN APPROVES
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Critical dispatches require operator decision
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} color="#94a3b8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={Boolean(selectedIncidentForApproval)}
        onClose={() => setSelectedIncidentForApproval(null)}
        onConfirm={handleConfirmApproval}
        incident={selectedIncidentForApproval}
        actionType={approvalAction}
      />
    </div>
  );
}

export default DashboardPage;
