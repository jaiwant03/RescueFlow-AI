import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { PriorityBadge } from '../components/PriorityBadge';
import { ApprovalModal } from '../components/ApprovalModal';
import { ModeledSelect } from '../components/ModeledSelect';
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
  Layers,
  Search,
  X,
  Filter,
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ApprovalCenterPage() {
  const { addToast, refreshStats } = useSystem();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('pending'); // 'pending' or 'all'
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [actionType, setActionType] = useState('approve');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

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

  // Statistics
  const stats = useMemo(() => {
    const pendingCount = approvals.filter(a => a.status === 'pending').length;
    const criticalCount = approvals.filter(a => a.priority_level === 'critical').length;
    const highCount = approvals.filter(a => a.priority_level === 'high').length;
    const approvedCount = approvals.filter(a => a.decision === 'approved').length;
    return { pendingCount, criticalCount, highCount, approvedCount };
  }, [approvals]);

  // Filtering
  const filteredApprovals = useMemo(() => {
    return approvals.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = item.incident_id?.toLowerCase().includes(q);
        const matchesLoc = item.location?.toLowerCase().includes(q);
        const matchesType = item.disaster_type?.toLowerCase().includes(q);
        if (!matchesId && !matchesLoc && !matchesType) return false;
      }
      // Priority
      if (priorityFilter !== 'all' && item.priority_level?.toLowerCase() !== priorityFilter.toLowerCase()) {
        return false;
      }
      // Type
      if (typeFilter !== 'all' && item.disaster_type?.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [approvals, searchQuery, priorityFilter, typeFilter]);

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

  const priorityOptions = [
    { value: 'all', label: 'All Priorities', dotColor: '#94a3b8' },
    { value: 'critical', label: 'Critical Only', dotColor: '#ef4444' },
    { value: 'high', label: 'High Priority', dotColor: '#f97316' },
    { value: 'medium', label: 'Medium Priority', dotColor: '#eab308' },
    { value: 'low', label: 'Low Priority', dotColor: '#10b981' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Incident Types' },
    { value: 'flood', label: 'Flood / Water Inundation' },
    { value: 'fire', label: 'Fire / Structural Blaze' },
    { value: 'medical', label: 'Medical Emergency' },
    { value: 'storm', label: 'Severe Storm / Cyclone' },
    { value: 'earthquake', label: 'Earthquake' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <span style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15) 0%, rgba(249, 115, 22, 0.05) 100%)',
              border: '1px solid rgba(234, 88, 12, 0.25)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckSquare size={20} color="#ea580c" />
            </span>
            <span className="heading-cursive-multicolor">Human-in-the-Loop Approval Center</span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px', marginBottom: 0, fontWeight: 500 }}>
            AI Recommends &bull; Command Authorizes &bull; Autonomous Dispatch Executed via n8n Engine
          </p>
        </div>

        <button 
          onClick={loadApprovals} 
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
            padding: '8px 16px',
            borderRadius: '10px',
            color: '#0f766e',
            fontWeight: 600,
            fontSize: '0.84rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <RotateCw size={14} className={loading ? 'spin' : ''} /> 
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}
      >
        {/* Card 1: Pending Reviews */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '16px 18px',
            border: '1.5px solid #fed7aa',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pending Authorization
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#9a3412', marginTop: '4px', lineHeight: 1.1 }}>
              {stats.pendingCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#78716c', marginTop: '4px' }}>
              Requires commander sign-off
            </div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#ffedd5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
            }}
          >
            <Clock size={22} />
          </div>
        </div>

        {/* Card 2: Critical Severity */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '16px 18px',
            border: '1.5px solid #fecaca',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Critical Threat Level
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#991b1b', marginTop: '4px', lineHeight: 1.1 }}>
              {stats.criticalCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#78716c', marginTop: '4px' }}>
              High-casualty risk threshold
            </div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* Card 3: High Priority */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '16px 18px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              High Priority Incidents
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#134e4a', marginTop: '4px', lineHeight: 1.1 }}>
              {stats.highCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
              Substantial resource need
            </div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#ccfbf1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0d9488',
            }}
          >
            <Flame size={22} />
          </div>
        </div>

        {/* Card 4: Automated Dispatch Link */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '16px 18px',
            border: '1.5px solid #d1fae5',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Autonomous Dispatch
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065f46', marginTop: '6px', lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Live Connected
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '6px' }}>
              Telegram &bull; Email &bull; Webhook
            </div>
          </div>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}
          >
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* Modeled Controls Bar (Segmented Tabs + Search + Dropdown Filters) */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #e2e8f0',
          padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Modeled Segmented Tabs */}
        <div
          style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '11px',
            border: '1px solid #e2e8f0',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setStatusTab('pending')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: statusTab === 'pending' ? 700 : 600,
              background: statusTab === 'pending' ? '#ffffff' : 'transparent',
              color: statusTab === 'pending' ? '#0f766e' : '#64748b',
              boxShadow: statusTab === 'pending' ? '0 2px 6px rgba(0,0,0,0.07)' : 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Clock size={15} color={statusTab === 'pending' ? 'var(--rama-green)' : 'currentColor'} />
            <span>Pending Authorizations</span>
            {stats.pendingCount > 0 && (
              <span
                style={{
                  background: '#ffedd5',
                  color: '#ea580c',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '1px 7px',
                  borderRadius: '10px',
                  marginLeft: '2px',
                }}
              >
                {stats.pendingCount}
              </span>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setStatusTab('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: statusTab === 'all' ? 700 : 600,
              background: statusTab === 'all' ? '#ffffff' : 'transparent',
              color: statusTab === 'all' ? '#0f766e' : '#64748b',
              boxShadow: statusTab === 'all' ? '0 2px 6px rgba(0,0,0,0.07)' : 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={15} color={statusTab === 'all' ? 'var(--rama-green)' : 'currentColor'} />
            <span>All Historical Records</span>
          </button>
        </div>

        {/* Right: Search & Modeled Dropdown Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              minWidth: '220px',
            }}
          >
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                color: '#94a3b8',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search by ID or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '10px',
                border: '1.5px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '0.83rem',
                color: '#1e293b',
                outline: 'none',
                transition: 'all 0.15s ease',
              }}
              onFocus={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.borderColor = 'var(--rama-green)';
                e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.background = '#f8fafc';
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Priority Modeled Select */}
          <ModeledSelect
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={priorityOptions}
            minWidth="160px"
          />

          {/* Disaster Type Modeled Select */}
          <ModeledSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
            minWidth="180px"
          />

          {/* Reset Filters button if any filter is dirty */}
          {(searchQuery || priorityFilter !== 'all' || typeFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setPriorityFilter('all');
                setTypeFilter('all');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 12px',
                borderRadius: '9px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#dc2626',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                cursor: 'pointer',
              }}
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Approvals Cards Grid */}
      {loading ? (
        <div 
          style={{ 
            padding: '50px 20px', 
            textAlign: 'center', 
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            color: '#64748b' 
          }}
        >
          <RotateCw size={26} className="spin" style={{ margin: '0 auto 12px', color: 'var(--rama-green)' }} />
          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Retrieving Emergency Dispatch Queue...</div>
        </div>
      ) : filteredApprovals.length === 0 ? (
        <div 
          style={{ 
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            padding: '48px 24px', 
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#ccfbf1',
              color: 'var(--rama-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h3 className="heading-cursive-multicolor" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
            No Pending Emergency Authorizations
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '460px', margin: '0 auto 18px', lineHeight: 1.5 }}>
            All high-priority disaster response dispatches have been authorized and dispatched. When a critical emergency threshold triggers, it will appear here for commander authorization.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link
              to="/emergency-report"
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #0077b6 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.84rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Simulate Emergency Ingestion <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
          {filteredApprovals.map((app) => {
            const isCritical = app.priority_level === 'critical';
            const isHigh = app.priority_level === 'high';
            const accentColor = isCritical ? '#ef4444' : isHigh ? '#f97316' : '#0d9488';

            return (
              <div
                key={app.approval_id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  position: 'relative'
                }}
              >
                {/* Top Accent Strip */}
                <div style={{ height: '4px', background: `linear-gradient(90deg, ${accentColor} 0%, #8b5cf6 100%)` }} />

                <div style={{ padding: '20px 20px 14px' }}>
                  {/* Top Bar: Incident ID + Priority Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          background: '#f1f5f9',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          color: '#0f766e',
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        <Link 
                          to={`/incidents/${app.incident_id}`} 
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {app.incident_id}
                        </Link>
                      </span>
                      {app.created_at && (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <PriorityBadge level={app.priority_level} score={app.priority_score} />
                  </div>

                  {/* Disaster Heading */}
                  <div 
                    style={{ 
                      fontSize: '1.08rem', 
                      fontWeight: 800, 
                      color: '#0f172a', 
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{app.disaster_type || 'Disaster'} Emergency</span>
                  </div>

                  {/* Location & Impact Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.83rem', color: '#334155' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={13} color="#0284c7" />
                      </div>
                      <span style={{ fontWeight: 600 }}>{app.location}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.83rem', color: '#64748b' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Users size={13} color="#64748b" />
                      </div>
                      <span>
                        <strong style={{ color: '#0f172a' }}>{app.people_affected || 0}</strong> residents reported affected
                      </span>
                    </div>
                  </div>

                  {/* Modeled AI Recommendation Box */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)',
                      border: '1.5px solid #ccfbf1',
                      borderRadius: '12px',
                      padding: '12px 14px',
                    }}
                  >
                    <div 
                      style={{ 
                        fontSize: '0.73rem', 
                        color: '#0f766e', 
                        fontWeight: 700, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      <Sparkles size={13} color="#0d9488" /> AI Recommended Response Units:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(app.recommended_resources || []).length > 0 ? (
                        app.recommended_resources.map((res, i) => (
                          <span
                            key={i}
                            style={{
                              background: '#ffffff',
                              color: '#0369a1',
                              border: '1px solid #bae6fd',
                              padding: '3px 9px',
                              borderRadius: '7px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                            }}
                          >
                            <Truck size={11} color="#0284c7" />
                            {res.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                          Standard Emergency First Response Team
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions / Decision Card Footer */}
                <div 
                  style={{ 
                    padding: '14px 20px', 
                    background: '#f8fafc', 
                    borderTop: '1px solid #f1f5f9' 
                  }}
                >
                  {app.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleOpenAction(app, 'approve')}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #0d9488 0%, #0077b6 100%)',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)',
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.92'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        <ShieldCheck size={16} /> AUTHORIZE DISPATCH
                      </button>
                      <button
                        onClick={() => handleOpenAction(app, 'reject')}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1.5px solid #fecaca',
                          background: '#ffffff',
                          color: '#dc2626',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                      >
                        <XCircle size={15} /> REJECT
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '9px 12px',
                        borderRadius: '9px',
                        background: app.decision === 'approved' ? '#ecfdf5' : '#fef2f2',
                        border: `1px solid ${app.decision === 'approved' ? '#a7f3d0' : '#fecaca'}`,
                        color: app.decision === 'approved' ? '#047857' : '#b91c1c',
                        fontSize: '0.81rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {app.decision === 'approved' ? (
                        <>
                          <CheckCircle2 size={16} color="#059669" />
                          <span>AUTHORIZED by {app.decided_by || 'Commander'}</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} color="#dc2626" />
                          <span>REJECTED by {app.decided_by || 'Commander'}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
