import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { DemoControlBar } from '../components/DemoControlBar';
import { IncidentMap } from '../components/IncidentMap';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { ApprovalModal } from '../components/ApprovalModal';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  AlertTriangle, 
  Activity, 
  CheckCircle, 
  Layers, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  ShieldCheck,
  MapPin,
  Users
} from 'lucide-react';

export function DashboardPage() {
  const { stats, refreshStats } = useSystem();
  const [incidents, setIncidents] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncidentForApproval, setSelectedIncidentForApproval] = useState(null);
  const [approvalAction, setApprovalAction] = useState('approve');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [incRes, appRes] = await Promise.all([
        api.getIncidents({ limit: 25 }),
        api.getApprovals('pending')
      ]);
      setIncidents(incRes.incidents || []);
      setApprovals(appRes.approvals || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleScenarioFinished = () => {
    loadData();
    refreshStats();
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1-Click Hackathon Demo Simulator Controller */}
      <DemoControlBar onScenarioComplete={handleScenarioFinished} />

      {/* Top Operations Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
        }}
      >
        {/* Total Incidents */}
        <div className="eoc-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>TOTAL INCIDENTS</span>
            <Activity size={16} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '6px 0 2px' }}>
            {stats.total_incidents || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Active & triage tracking
          </div>
        </div>

        {/* Critical */}
        <div className="eoc-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>CRITICAL</span>
            <Flame size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', margin: '6px 0 2px' }}>
            {stats.critical || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#ef4444' }}>
            Immediate life danger
          </div>
        </div>

        {/* High */}
        <div className="eoc-card" style={{ borderLeft: '4px solid #f97316' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>HIGH</span>
            <AlertTriangle size={16} color="#f97316" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f97316', margin: '6px 0 2px' }}>
            {stats.high || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#f97316' }}>
            High-consequence response
          </div>
        </div>

        {/* Medium */}
        <div className="eoc-card" style={{ borderLeft: '4px solid #eab308' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>MEDIUM</span>
            <Clock size={16} color="#eab308" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#eab308', margin: '6px 0 2px' }}>
            {stats.medium || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Controlled triage
          </div>
        </div>

        {/* Deduplication Efficiency */}
        <div className="eoc-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>DEDUP SAVINGS</span>
            <Layers size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', margin: '6px 0 2px' }}>
            {stats.deduplication_saved || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981' }}>
            Fragmented reports merged
          </div>
        </div>

        {/* Resolved */}
        <div className="eoc-card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>RESOLVED</span>
            <CheckCircle size={16} color="#6366f1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '6px 0 2px' }}>
            {stats.resolved || 0}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Completed operations
          </div>
        </div>
      </div>

      {/* Main Command Center Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Left Column: Interactive Map & Live Incidents Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Tactical Map */}
          <div className="eoc-card" style={{ padding: '16px' }}>
            <div className="eoc-card-header">
              <div className="eoc-card-title">
                <MapPin size={18} color="var(--accent-cyan)" />
                <span>Tactical Disaster Geo-Operations Map</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {incidents.filter(i => i.latitude).length} Geo-Located Incidents
              </span>
            </div>
            <IncidentMap incidents={incidents} height="360px" />
          </div>

          {/* Active Incidents Priority Table */}
          <div className="eoc-card">
            <div className="eoc-card-header">
              <div className="eoc-card-title">
                <Activity size={18} color="#ef4444" />
                <span>Live Priority Incident Queue</span>
              </div>
              <Link to="/incidents" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All ({incidents.length}) <ArrowRight size={14} />
              </Link>
            </div>

            {incidents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                No active incidents recorded. Click any demo step button above to simulate an emergency intake!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="eoc-table">
                  <thead>
                    <tr>
                      <th>Incident ID</th>
                      <th>Priority</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Impact</th>
                      <th>Reports</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.slice(0, 7).map((inc) => (
                      <tr key={inc.incident_id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          <Link to={`/incidents/${inc.incident_id}`} style={{ color: 'var(--accent-cyan)' }}>
                            {inc.incident_id}
                          </Link>
                        </td>
                        <td>
                          <PriorityBadge level={inc.priority_level} score={inc.priority_score} />
                        </td>
                        <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                          {inc.type}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                          {inc.location}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: inc.people_affected > 0 ? '#ffffff' : 'var(--text-muted)' }}>
                            {inc.people_affected || 0}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              background: inc.report_count > 1 ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                              color: inc.report_count > 1 ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                            }}
                          >
                            {inc.report_count}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={inc.status} />
                        </td>
                        <td>
                          <Link to={`/incidents/${inc.incident_id}`} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                            Inspect
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Approvals Queue & Channel Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pending Human Approvals */}
          <div className="eoc-card" style={{ borderTop: '4px solid #f59e0b' }}>
            <div className="eoc-card-header">
              <div className="eoc-card-title">
                <ShieldCheck size={18} color="#f59e0b" />
                <span>Pending Human Authorizations</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>
                {approvals.length} REQUIRED
              </span>
            </div>

            {approvals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                ✓ All high-priority incidents authorized or none pending.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {approvals.slice(0, 3).map((app) => (
                  <div
                    key={app.approval_id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#ffffff' }}>
                        {app.incident_id}
                      </span>
                      <PriorityBadge level={app.priority_level} score={app.priority_score} />
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                      {app.disaster_type?.toUpperCase()} — {app.location}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      {app.people_affected || 0} affected | Units: {(app.recommended_resources || []).join(', ') || 'First Responders'}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenApproval({ incident_id: app.incident_id, ...app }, 'approve')}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '6px 10px', fontSize: '0.78rem' }}
                      >
                        Approve Response
                      </button>
                      <button
                        onClick={() => handleOpenApproval({ incident_id: app.incident_id, ...app }, 'reject')}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#ef4444' }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Core Concept Architecture Summary */}
          <div
            className="eoc-card"
            style={{
              background: 'linear-gradient(180deg, #10192e 0%, #0d1526 100%)',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div className="eoc-card-header">
              <div className="eoc-card-title" style={{ fontSize: '0.9rem' }}>
                <TrendingUp size={16} color="var(--accent-cyan)" />
                <span>Orchestration Pipeline Principles</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', background: 'var(--bg-surface)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>AI UNDERSTANDS:</span>
                <span style={{ color: 'var(--text-secondary)' }}>Groq LLM extracts needs, disaster type & location</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', background: 'var(--bg-surface)', borderRadius: '6px' }}>
                <span style={{ color: '#f97316', fontWeight: 700 }}>n8n AUTOMATES:</span>
                <span style={{ color: 'var(--text-secondary)' }}>Central workflows coordinate intake & notifications</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', background: 'var(--bg-surface)', borderRadius: '6px' }}>
                <span style={{ color: '#10b981', fontWeight: 700 }}>MONGODB REMEMBERS:</span>
                <span style={{ color: 'var(--text-secondary)' }}>Corroborating reports merge without data loss</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', background: 'var(--bg-surface)', borderRadius: '6px' }}>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>HUMAN APPROVES:</span>
                <span style={{ color: 'var(--text-secondary)' }}>Critical dispatches require operator decision</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Action Modal */}
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
