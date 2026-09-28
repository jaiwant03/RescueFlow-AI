import React, { useState } from 'react';
import { ShieldCheck, XCircle, AlertTriangle, X } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';

export function ApprovalModal({ isOpen, onClose, onConfirm, incident, actionType = 'approve' }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !incident) return null;

  const isApprove = actionType === 'approve';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(reason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
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
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          border: `2px solid ${isApprove ? 'var(--rama-green)' : 'var(--priority-critical)'}`,
          borderRadius: '14px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-main)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isApprove ? <ShieldCheck size={20} color="var(--rama-green)" /> : <XCircle size={20} color="var(--priority-critical)" />}
            <h3 className="heading-cursive-multicolor" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {isApprove ? 'Authorize Emergency Deployment' : 'Reject Response Request'}
            </h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* Incident Summary Card */}
          <div
            style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '14px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--peacock-deep)' }}>
                {incident.incident_id}
              </span>
              <PriorityBadge level={incident.priority_level} score={incident.priority_score} />
            </div>

            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--peacock-deep)', marginBottom: '4px' }}>
              {incident.type?.toUpperCase()} — {incident.location}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {incident.people_affected || 0} people affected | {incident.report_count || 1} corroborating reports
            </div>

            {incident.resources_required && incident.resources_required.length > 0 && (
              <div style={{ marginTop: '10px', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recommended Units: </span>
                <span style={{ color: 'var(--rama-deep)', fontWeight: 700 }}>
                  {incident.resources_required.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Reason Input */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--peacock-deep)' }}>
              {isApprove ? 'Deployment Authorization Note (Optional):' : 'Rejection Justification (Required):'}
            </label>
            <textarea
              required={!isApprove}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isApprove ? 'E.g., Authorized after visual drone/CCTV corroboration...' : 'E.g., Duplicate report / false alarm / non-critical...'}
              rows={3}
              style={{ width: '100%', resize: 'none' }}
            />
          </div>

          {/* Operational notification notice */}
          <div
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-main)',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <ShieldCheck size={16} color="var(--rama-green)" style={{ flexShrink: 0 }} />
            <span>
              Authorizing this response will automatically dispatch task orders to emergency response units via Telegram and Email channels.
            </span>
          </div>


          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`btn ${isApprove ? 'btn-primary' : 'btn-danger'}`}
            >
              {loading ? 'Executing...' : (isApprove ? 'Approve & Dispatch' : 'Confirm Rejection')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApprovalModal;
