import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { PriorityBadge } from '../components/PriorityBadge';
import { ApprovalModal } from '../components/ApprovalModal';
import { useSystem } from '../context/SystemContext';
import { 
  CheckSquare, 
  RotateCw, 
  ShieldCheck, 
  XCircle, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Truck,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ApprovalCenterPage() {
  const { addToast, refreshStats } = useSystem();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('pending'); // 'pending' or 'all'
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [actionType, setActionType] = useState('approve');

  const loadApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getApprovals(statusTab === 'pending' ? 'pending' : null);
      setApprovals(res.approvals || []);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  }, [statusTab]);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  const handleOpenAction = (approval, type) => {
    setSelectedApproval({
      ...approval,
      type: approval.disaster_type,
      resources_required: approval.recommended_resources,
    });
    setActionType(type);
  };

  const handleConfirmDecision = async (reason) => {
    if (!selectedApproval) return;
    try {
      await api.submitApprovalDecision(
        selectedApproval.approval_id,
        actionType,
        reason,
        'Command Chief'
      );
      addToast(
        actionType === 'approve' ? 'Response Approved' : 'Response Rejected',
        `Incident ${selectedApproval.incident_id} ${actionType === 'approve' ? 'authorized for automated dispatch' : 'rejected'}.`,
        actionType === 'approve' ? 'info' : 'warning'
      );
      loadApprovals();
      refreshStats();
    } catch (err) {
      addToast('Action Failed', err.message, 'warning');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckSquare size={22} color="#ea580c" />
            <span className="heading-cursive-multicolor">Human-in-the-Loop Approval Center</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            AI Recommends &bull; Human Decides &bull; n8n Executes Approved Operations
          </p>
        </div>

        <button onClick={loadApprovals} className="btn btn-secondary">
          <RotateCw size={14} /> Refresh
        </button>
      </div>

      {/* Modeled Segmented Tabs */}
      <div
        style={{
          display: 'inline-flex',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          gap: '4px',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          onClick={() => setStatusTab('pending')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9px',
            fontSize: '0.84rem',
            fontWeight: statusTab === 'pending' ? 700 : 600,
            background: statusTab === 'pending' ? '#ffffff' : 'transparent',
            color: statusTab === 'pending' ? '#0f766e' : '#64748b',
            boxShadow: statusTab === 'pending' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Clock size={15} color={statusTab === 'pending' ? 'var(--rama-green)' : 'currentColor'} />
          <span>Pending Authorizations</span>
        </button>
        <button
          type="button"
          onClick={() => setStatusTab('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9px',
            fontSize: '0.84rem',
            fontWeight: statusTab === 'all' ? 700 : 600,
            background: statusTab === 'all' ? '#ffffff' : 'transparent',
            color: statusTab === 'all' ? '#0f766e' : '#64748b',
            boxShadow: statusTab === 'all' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={15} color={statusTab === 'all' ? 'var(--rama-green)' : 'currentColor'} />
          <span>All Authorization Records</span>
        </button>
      </div>

      {/* Approvals Cards Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading approval requests...
        </div>
      ) : approvals.length === 0 ? (
        <div className="eoc-card" style={{ padding: '40px', textAlign: 'center' }}>
          <ShieldCheck size={36} color="var(--rama-green)" style={{ margin: '0 auto 12px' }} />
          <h3 className="heading-cursive-multicolor" style={{ fontSize: '1.25rem', marginBottom: '6px' }}>
            No Pending Emergency Authorizations
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
            All high-priority disaster response dispatches have been authorized. When a critical report is received, it will appear here for operator review.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {approvals.map((app) => (
            <div
              key={app.approval_id}
              className="eoc-card"
              style={{
                borderLeft: `4px solid ${app.priority_level === 'critical' ? '#ef4444' : '#f97316'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem' }}>
                    <Link to={`/incidents/${app.incident_id}`} style={{ color: 'var(--accent-cyan)' }}>
                      {app.incident_id}
                    </Link>
                  </span>
                  <PriorityBadge level={app.priority_level} score={app.priority_score} />
                </div>

                {/* Disaster details */}
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--peacock-deep)', marginBottom: '6px' }}>
                  {app.disaster_type?.toUpperCase()} EMERGENCY
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <MapPin size={14} color="var(--accent-cyan)" />
                  <span>{app.location}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  <Users size={14} color="var(--text-muted)" />
                  <span>{app.people_affected || 0} residents reported affected</span>
                </div>

                {/* AI Recommendation */}
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    <Sparkles size={12} color="var(--accent-cyan)" /> AI RECOMMENDED UNITS:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(app.recommended_resources || []).length > 0 ? (
                      app.recommended_resources.map((res, i) => (
                        <span
                          key={i}
                          style={{
                            background: 'rgba(6, 182, 212, 0.15)',
                            color: 'var(--accent-cyan)',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {res.replace('_', ' ').toUpperCase()}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emergency First Response Team</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions / Status */}
              <div>
                {app.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleOpenAction(app, 'approve')}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '10px' }}
                    >
                      <ShieldCheck size={16} /> APPROVE RESPONSE
                    </button>
                    <button
                      onClick={() => handleOpenAction(app, 'reject')}
                      className="btn btn-secondary"
                      style={{ color: '#ef4444', padding: '10px 14px' }}
                    >
                      REJECT
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      background: app.decision === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: app.decision === 'approved' ? '#10b981' : '#ef4444',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textAlign: 'center',
                    }}
                  >
                    Decision: {app.decision?.toUpperCase()} by {app.decided_by || 'Commander'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decision Modal */}
      <ApprovalModal
        isOpen={Boolean(selectedApproval)}
        onClose={() => setSelectedApproval(null)}
        onConfirm={handleConfirmDecision}
        incident={selectedApproval}
        actionType={actionType}
      />
    </div>
  );
}

export default ApprovalCenterPage;
