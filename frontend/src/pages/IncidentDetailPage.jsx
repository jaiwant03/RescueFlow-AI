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
  Sparkles,
  RotateCw,
  Radio,
  FileText,
  UserCheck
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
      await api.updateIncidentStatus(id, newStatus, `Operator transition to ${newStatus}`);
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
    return (
      <div 
        style={{ 
          padding: '60px 20px', 
          textAlign: 'center', 
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          color: '#64748b' 
        }}
      >
        <RotateCw size={26} className="spin" style={{ margin: '0 auto 12px', color: 'var(--rama-green)' }} />
        <div style={{ fontWeight: 600, fontSize: '0.94rem' }}>Loading Incident {id}...</div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div 
        style={{ 
          padding: '60px 20px', 
          textAlign: 'center', 
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #fecaca',
        }}
      >
        <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ color: '#ef4444', fontSize: '1.25rem', marginBottom: '8px' }}>Incident Not Found</h3>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>The requested incident ID could not be located in the active emergency registry.</p>
        <Link 
          to="/incidents" 
          className="btn btn-secondary" 
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={14} /> Back to Live Incident Queue
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Back button & Incident Command Header */}
      <div>
        <Link 
          to="/incidents" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.82rem', 
            color: '#0f766e', 
            fontWeight: 700,
            textDecoration: 'none',
            marginBottom: '10px',
            background: '#f0fdfa',
            padding: '4px 10px',
            borderRadius: '8px',
            border: '1px solid #ccfbf1'
          }}
        >
          <ArrowLeft size={14} /> Back to Live Incidents
        </Link>

        <div 
          style={{ 
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            padding: '18px 22px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '14px' 
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 
                style={{ 
                  fontSize: '1.65rem', 
                  fontWeight: 800, 
                  fontFamily: 'var(--font-mono)', 
                  color: '#0f172a', 
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span className="heading-cursive-multicolor">{incident.incident_id}</span>
              </h1>
              <PriorityBadge level={incident.priority_level} score={incident.priority_score} />
              <StatusBadge status={incident.status} />
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '6px', marginBottom: 0, fontWeight: 500 }}>
              <strong style={{ color: '#0f766e', textTransform: 'uppercase' }}>{incident.type}</strong> EMERGENCY &bull; Ingested at {new Date(incident.created_at).toLocaleString()}
            </p>
          </div>

          {/* Operational Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {incident.status === 'pending' && (
              <>
                <button
                  onClick={() => { setApprovalAction('approve'); setApprovalModalOpen(true); }}
                  style={{
                    background: 'linear-gradient(135deg, #0d9488 0%, #0077b6 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 16px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)'
                  }}
                >
                  <ShieldCheck size={16} /> Authorize Response
                </button>
                <button
                  onClick={() => { setApprovalAction('reject'); setApprovalModalOpen(true); }}
                  style={{
                    background: '#ffffff',
                    color: '#dc2626',
                    border: '1.5px solid #fecaca',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Reject
                </button>
              </>
            )}

            <button
              onClick={() => setAssignTeamModalOpen(true)}
              style={{
                background: '#ffffff',
                color: '#0f766e',
                border: '1.5px solid #e2e8f0',
                padding: '9px 14px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <Truck size={15} color="#0d9488" /> {incident.assigned_team ? `Team: ${incident.assigned_team}` : 'Assign Tactical Team'}
            </button>

            {incident.status !== 'responding' && incident.status !== 'resolved' && (
              <button
                onClick={() => handleStatusChange('responding')}
                style={{
                  background: '#f5f3ff',
                  color: '#6d28d9',
                  border: '1.5px solid #ddd6fe',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Activity size={15} /> Mark Responding
              </button>
            )}

            {incident.status !== 'resolved' && (
              <button
                onClick={() => handleStatusChange('resolved')}
                style={{
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1.5px solid #a7f3d0',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle size={15} color="#10b981" /> Mark Resolved
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Overview & Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '20px' }}>
        {/* Left Column: AI Extraction, Needs, Map, and Source Messages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Intelligence Summary Card */}
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              padding: '22px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} color="var(--rama-green)" />
                </div>
                <span>AI Situation Intelligence & Extraction</span>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#0f766e', fontWeight: 700, background: '#f0fdfa', padding: '3px 8px', borderRadius: '6px', border: '1px solid #ccfbf1' }}>
                Groq AI Llama-3.3-70B Active
              </span>
            </div>

            <div style={{ fontSize: '0.94rem', color: '#1e293b', lineHeight: 1.6, marginBottom: '18px', fontWeight: 500 }}>
              {incident.ai_summary || 'Urgent incident requiring rapid tactical field triage and immediate unit dispatch.'}
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '18px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Location Zone</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>
                  {incident.location}
                </div>
              </div>
              
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>People Affected</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>
                  {incident.people_affected || 0} residents
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Corroboration</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f766e', marginTop: '3px' }}>
                  {incident.report_count || 1} corroborating reports
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Team</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>
                  {incident.assigned_team || 'Pending dispatch'}
                </div>
              </div>
            </div>

            {/* Immediate Needs & Resources Required Tags */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#dc2626', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Immediate Needs:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(incident.immediate_needs || []).length > 0 ? (
                    incident.immediate_needs.map((need, idx) => (
                      <span key={idx} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '3px 9px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {need}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>None explicitly stated</span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0369a1', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Required Response Units:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(incident.resources_required || []).length > 0 ? (
                    incident.resources_required.map((res, idx) => (
                      <span key={idx} style={{ background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '3px 9px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {res.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>Tactical First Responders</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Incident Geo Map */}
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={16} color="#0284c7" />
                </div>
                <span>Geographic Incident Coordinates</span>
              </div>
              <span style={{ fontSize: '0.76rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                {incident.latitude ? `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}` : 'Coordinates text-resolved'}
              </span>
            </div>
            <IncidentMap incidents={[incident]} selectedIncident={incident} height="280px" />
          </div>

          {/* Source Messages (Multi-Report Deduplication Drilldown) */}
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={16} color="#8b5cf6" />
                </div>
                <span>Corroborating Reports ({incident.source_messages?.length || 1})</span>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#0f766e', fontWeight: 700, background: '#f0fdfa', padding: '3px 8px', borderRadius: '6px', border: '1px solid #ccfbf1' }}>
                Unified by Deduplication Engine
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(incident.source_messages || []).map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: '#f0fdfa',
                          color: '#0f766e',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #ccfbf1'
                        }}
                      >
                        {msg.source}
                      </span>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                        {msg.sender || 'Citizen Reporter'}
                      </span>
                      {msg.phone && (
                        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          &bull; {msg.phone}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
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
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Flame size={16} color="#ef4444" />
                </div>
                <span>Deterministic Priority Scoring</span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#dc2626', background: '#fef2f2', padding: '3px 8px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                {incident.priority_score} / 100
              </span>
            </div>

            <div style={{ marginBottom: '14px', fontSize: '0.82rem', color: '#64748b' }}>
              Deterministic scoring based on verified casualties, life hazards, and situational reports:
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
                    background: '#f8fafc',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    borderLeft: '3px solid #0d9488',
                  }}
                >
                  <CheckCircle size={15} color="#0d9488" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{reason}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '14px', fontSize: '0.73rem', color: '#64748b', textAlign: 'right' }}>
              Autonomous Deterministic Scoring Engine v1.0
            </div>
          </div>

          {/* Incident Timeline (Audit trail for this incident) */}
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              padding: '20px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} color="var(--rama-green)" />
                </div>
                <span>Orchestration Timeline</span>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Intake to Resolution
              </span>
            </div>

            <div style={{ position: 'relative', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Vertical line */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  bottom: '8px',
                  left: '6px',
                  width: '2px',
                  background: '#e2e8f0',
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
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'var(--rama-green)',
                      boxShadow: '0 0 0 3px rgba(13, 148, 136, 0.2)',
                    }}
                  />
                  <div style={{ paddingLeft: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                        {item.event_type}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.79rem', color: '#475569', marginTop: '3px', marginBottom: '2px', lineHeight: 1.4 }}>
                      {item.description}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                      Actor: {item.actor || 'RescueFlow Engine'}
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
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
              border: '1.5px solid #e2e8f0', 
              borderRadius: '16px', 
              padding: '24px', 
              width: '90%', 
              maxWidth: '420px', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
            }}
          >
            <h3 className="heading-cursive-multicolor" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '14px' }}>
              Assign Tactical Field Team
            </h3>
            <form onSubmit={handleAssignTeam}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#334155', fontWeight: 700, marginBottom: '6px' }}>
                  Team Name or Unit Designation:
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Rapid Flood Unit Alpha, Fire Brigade 3"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setAssignTeamModalOpen(false)} 
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9px',
                    border: '1.5px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0d9488 0%, #0077b6 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
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
