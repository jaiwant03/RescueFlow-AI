import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { 
  Radio, 
  Search, 
  Filter, 
  RotateCw, 
  ExternalLink, 
  MapPin, 
  Users, 
  Calendar,
  Layers,
  ChevronRight
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--peacock-deep)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Radio size={22} color="var(--rama-green)" /> Live Emergency Incidents
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Real-time multi-channel incident feed with deduplication & explainable priority scoring
          </p>
        </div>

        <button onClick={loadIncidents} className="btn btn-secondary">
          <RotateCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="eoc-card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by ID, location, or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Priority:</span>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="critical">Critical (80+)</option>
            <option value="high">High (60-79)</option>
            <option value="medium">Medium (30-59)</option>
            <option value="low">Low (0-29)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Status:</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="responding">Responding</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Disaster Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Type:</span>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Disaster Types</option>
            <option value="flood">Flood</option>
            <option value="fire">Fire</option>
            <option value="medical">Medical</option>
            <option value="building_collapse">Building Collapse</option>
            <option value="accident">Accident</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Incidents Table / Card List */}
      <div className="eoc-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading live emergency incidents...
          </div>
        ) : incidents.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No incidents matched your query. Use the Simulation Controller on Dashboard to generate reports.
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
                    <td style={{ color: '#ffffff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="var(--accent-cyan)" />
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
