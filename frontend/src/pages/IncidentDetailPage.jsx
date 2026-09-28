import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { IncidentMap } from '../components/IncidentMap';
import { ApprovalModal } from '../components/ApprovalModal';
import { useSystem } from '../context/SystemContext';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Layers, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Send,
  Truck,
  Flame,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export function IncidentDetailPage() {
  const { id } = useParams();
  const { addToast } = useSystem();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState('approve');
  const [assignTeamModalOpen, setAssignTeamModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');

  const loadIncident = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getIncidentById(id);
      setIncident(data);
    } catch (err) {
      console.error('Failed to load incident detail:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadIncident();
  }, [loadIncident]);

  const handleStatusChange = async (newStatus) => {
    try {
      await api.updateIncidentStatus(id, newStatus, `Operator manual transition to ${newStatus}`);
      addToast('Status Updated', `Incident status set to ${newStatus.toUpperCase()}`, 'info');
      loadIncident();
    } catch (err) {
      addToast('Update Failed', err.message, 'warning');
    }
  };

  const handleApprovalConfirm = async (reason) => {
    try {
      if (approvalAction === 'approve') {
        await api.approveIncident(id, reason);
        addToast('Response Authorized', 'Automated response dispatched via n8n.', 'info');
      } else {
        await api.rejectIncident(id, reason);
        addToast('Request Rejected', 'Response authorization rejected.', 'warning');
      }
      loadIncident();
    } catch (err) {
      addToast('Action Failed', err.message, 'warning');
    }
  };

  const handleAssignTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    try {
      await api.assignTeam(id, teamName.trim());
      addToast('Team Assigned', `Field team '${teamName}' assigned to incident.`, 'info');
      setAssignTeamModalOpen(false);
      setTeamName('');
      loadIncident();
    } catch (err) {
      addToast('Assignment Failed', err.message, 'warning');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading incident {id}...</div>;
  }

  if (!incident) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ color: '#ef4444' }}>Incident Not Found</h3>
        <Link to="/incidents" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Incidents List
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Back button & Header */}
      <div>
        <Link to="/incidents" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
          <ArrowLeft size={14} /> Back to Live Incidents
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--peacock-deep)' }}>
                {incident.incident_id}
              </h1>
              <PriorityBadge level={incident.priority_level} score={incident.priority_score} />
              <StatusBadge status={incident.status} />
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {incident.type?.toUpperCase()} EMERGENCY &bull; Reported at {new Date(incident.created_at).toLocaleString()}
            </p>
          </div>

          {/* Operational Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {incident.status === 'pending' && (
              <>
                <button
                  onClick={() => { setApprovalAction('approve'); setApprovalModalOpen(true); }}
                  className="btn btn-primary"
                >
                  <ShieldCheck size={16} /> Approve Response
                </button>
                <button
                  onClick={() => { setApprovalAction('reject'); setApprovalModalOpen(true); }}
                  className="btn btn-secondary"
                  style={{ color: '#ef4444' }}
                >
                  Reject
                </button>
              </>
            )}

            <button
              onClick={() => setAssignTeamModalOpen(true)}
              className="btn btn-secondary"
            >
              <Truck size={15} /> {incident.assigned_team ? `Team: ${incident.assigned_team}` : 'Assign Team'}
            </button>

            {incident.status !== 'responding' && incident.status !== 'resolved' && (
              <button
                onClick={() => handleStatusChange('responding')}
                className="btn btn-secondary"
                style={{ color: '#a78bfa' }}
              >
                Mark Responding
              </button>
            )}

            {incident.status !== 'resolved' && (
              <button
                onClick={() => handleStatusChange('resolved')}
                className="btn btn-success"
              >
                <CheckCircle size={15} /> Mark Resolved
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Overview & Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
        {/* Left Column: AI Extraction, Needs, Map, and Source Messages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Intelligence Summary Card */}
          <div className="eoc-card">
            <div className="eoc-card-header">
              <div className="eoc-card-title">
                <Sparkles size={18} color="var(--accent-cyan)" />
                <span>AI Situation Intelligence & Extraction</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Deterministic + Groq Extraction
              </span>
            </div>

            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '16px' }}>
              {incident.ai_summary || 'Urgent emergency requiring tactical field response and immediate triage.'}
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>LOCATION</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--peacock-deep)', marginTop: '2px' }}>
                  {incident.location}
                </div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PEOPLE AFFECTED</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--peacock-deep)', marginTop: '2px' }}>
                  {incident.people_affected || 0} residents
                </div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>CORROBORATION</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--rama-green)', marginTop: '2px' }}>
                  {incident.report_count || 1} independent reports
                </div>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ASSIGNED TEAM</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--peacock-deep)', marginTop: '2px' }}>
                  {incident.assigned_team || 'Pending dispatch'}
                </div>
              </div>
            </div>

            {/* Immediate Needs & Resources Required Tags */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  IMMEDIATE NEEDS:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(incident.immediate_needs || []).length > 0 ? (
                    incident.immediate_needs.map((need, idx) => (
                      <span key={idx} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {need}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None explicitly stated</span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  REQUIRED RESOURCES:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(incident.resources_required || []).length > 0 ? (
                    incident.resources_required.map((res, idx) => (
                      <span key={idx} style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {res.replace('_', ' ').toUpperCase()}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tactical First Responders</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Incident Geo Map */}
          <div className="eoc-card">
            <div className="eoc-card-header">
              <div className="eoc-card-title">
                <MapPin size={18} color="var(--accent-cyan)" />
                <span>Geographic Operational Location</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {incident.latitude ? `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}` : 'Coordinates text-resolved'}
              </span>
            </div>
            <IncidentMap incidents={[incident]} selectedIncident={incident} height="280px" />
          </div>

          {/* Source Messages (Multi-Report Deduplication Drilldown) */}
          <div className="eoc-card">
            <div className="eoc-card-header">
              <div className="eoc-card-title">
                <MessageSquare size={18} color="var(--accent-cyan)" />
                <span>Corroborating Source Reports ({incident.source_messages?.length || 1})</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Deduplicated into Single Incident
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(incident.source_messages || []).map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: 'rgba(6, 182, 212, 0.15)',
                          color: 'var(--accent-cyan)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {msg.source}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--peacock-deep)' }}>
                        {msg.sender || 'Citizen'}
                      </span>
                      {msg.phone && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          &bull; {msg.phone}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    "{msg.message}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Explainable Priority Engine & Chronological Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Explainable Priority Breakdown */}
          <div className="eoc-card" style={{ borderTop: '4px solid var(--priority-critical)' }}>
            <div className="eoc-card-header">
              <div className="eoc-card-title">
                <Flame size={18} color="var(--priority-critical)" />
                <span>Deterministic Priority Engine</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--priority-critical)' }}>
                SCORE: {incident.priority_score} / 100
              </span>
            </div>

            <div style={{ marginBottom: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              RescueFlow evaluates deterministic impact factors rather than unverified LLM assertions:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(incident.priority_reasons || []).map((reason, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.82rem',
                    background: 'var(--bg-main)',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    borderLeft: '3px solid var(--rama-green)',
                  }}
                >
                  <CheckCircle size={14} color="var(--rama-green)" style={{ flexShrink: 0 }} />
                  <span style={{ color: 'var(--peacock-deep)', fontWeight: 600 }}>{reason}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '14px', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              Demo Priority Algorithm v1.0
            </div>
          </div>

          {/* Incident Timeline (Audit trail for this incident) */}
          <div className="eoc-card">
            <div className="eoc-card-header">
              <div className="eoc-card-title">
                <Clock size={18} color="var(--accent-cyan)" />
                <span>Orchestration Timeline</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Intake to Resolution
              </span>
            </div>

            <div style={{ position: 'relative', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Vertical line */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  bottom: '8px',
                  left: '6px',
                  width: '2px',
                  background: 'var(--border-medium)',
                }}
              />

              {(incident.timeline || []).map((item, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  {/* Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-14px',
                      top: '4px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--accent-cyan)',
                      boxShadow: '0 0 6px var(--accent-cyan)',
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--peacock-deep)' }}>
                        {item.event_type}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {item.description}
                    </p>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Actor: {item.actor || 'System'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Approval Confirmation Modal */}
      <ApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onConfirm={handleApprovalConfirm}
        incident={incident}
        actionType={approvalAction}
      />

      {/* Team Assignment Modal */}
      {assignTeamModalOpen && (
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
          <div style={{ background: '#ffffff', border: '1px solid var(--border-medium)', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--peacock-deep)' }}>
              Assign Field Response Team
            </h3>
            <form onSubmit={handleAssignTeam}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Team Name or Unit Designation:
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Rapid Flood Unit Alpha, Fire Brigade 3"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setAssignTeamModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Assign Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncidentDetailPage;
