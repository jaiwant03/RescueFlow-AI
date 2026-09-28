import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { ModeledSelect } from '../components/ModeledSelect';
import { Link } from 'react-router-dom';
import { 
  Radio, 
  Search, 
  Filter, 
  RotateCw, 
  RotateCcw,
  ExternalLink, 
  MapPin, 
  Users, 
  Calendar,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';

export function LiveIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const loadIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.getIncidents(params);
      setIncidents(res.incidents || []);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, typeFilter, search]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'critical', label: 'Critical (80+)', dotColor: '#ef4444' },
    { value: 'high', label: 'High (60-79)', dotColor: '#f97316' },
    { value: 'medium', label: 'Medium (30-59)', dotColor: '#eab308' },
    { value: 'low', label: 'Low (0-29)', dotColor: '#10b981' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending', dotColor: '#f59e0b' },
    { value: 'approved', label: 'Approved', dotColor: '#0284c7' },
    { value: 'responding', label: 'Responding', dotColor: '#3b82f6' },
    { value: 'monitoring', label: 'Monitoring', dotColor: '#8b5cf6' },
    { value: 'resolved', label: 'Resolved', dotColor: '#10b981' },
    { value: 'rejected', label: 'Rejected', dotColor: '#64748b' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Disaster Types' },
    { value: 'flood', label: 'Flood', dotColor: '#0284c7' },
    { value: 'fire', label: 'Fire', dotColor: '#ef4444' },
    { value: 'medical', label: 'Medical', dotColor: '#10b981' },
    { value: 'building_collapse', label: 'Building Collapse', dotColor: '#d97706' },
    { value: 'accident', label: 'Accident', dotColor: '#f59e0b' },
    { value: 'other', label: 'Other', dotColor: '#64748b' },
  ];

  const hasActiveFilters = search.trim() !== '' || priorityFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setPriorityFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Radio size={22} color="var(--rama-green)" />
            <span className="heading-cursive-multicolor">Live Emergency Incidents</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Real-time multi-channel incident feed with deduplication & explainable priority scoring
          </p>
        </div>

        <button onClick={loadIncidents} className="btn btn-secondary">
          <RotateCw size={14} /> Refresh
        </button>
      </div>

      {/* Modeled Filter and Search Bar */}
      <div
        className="eoc-card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 2px 10px rgba(0, 50, 70, 0.04), 0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        {/* Search Modeled Input */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            flex: '1 1 260px',
            maxWidth: '380px',
          }}
        >
          <Search
            size={16}
            color="var(--rama-green)"
            style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Search by ID, location, or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '36px',
              paddingRight: search ? '32px' : '14px',
              paddingTop: '8px',
              paddingBottom: '8px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.84rem',
              outline: 'none',
              background: '#ffffff',
              transition: 'all 0.15s ease',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Modeled Filter Options Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <ModeledSelect
            label="Priority:"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={priorityOptions}
            minWidth="145px"
          />

          <ModeledSelect
            label="Status:"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            minWidth="140px"
          />

          <ModeledSelect
            label="Type:"
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
            minWidth="155px"
          />

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Reset all filters"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Incidents Table / Card List */}
      <div className="eoc-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading live emergency incidents...
          </div>
        ) : incidents.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
            No incidents matched your query. Ingest new reports via Emergency Report or the Live Operations Bar.
          </div>

        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="eoc-table">
              <thead>
                <tr>
                  <th>Incident ID</th>
                  <th>Priority Score</th>
                  <th>Disaster Type</th>
                  <th>Location</th>
                  <th>Impact (People)</th>
                  <th>Corroborating Reports</th>
                  <th>Status</th>
                  <th>Reported Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
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
                    <td style={{ color: 'var(--peacock-deep)', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="var(--rama-green)" />
                        <span>{inc.location}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={12} color="var(--text-muted)" />
                        <span style={{ fontWeight: 600 }}>{inc.people_affected || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={13} color={inc.report_count > 1 ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                        <span
                          style={{
                            fontWeight: 700,
                            color: inc.report_count > 1 ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                          }}
                        >
                          {inc.report_count}
                        </span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={inc.status} />
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <Link
                        to={`/incidents/${inc.incident_id}`}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                      >
                        Inspect <ChevronRight size={12} />
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
  );
}

export default LiveIncidentsPage;
