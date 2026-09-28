import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { ModeledSelect } from '../components/ModeledSelect';
import { 
  Activity, 
  RotateCw, 
  RotateCcw,
  Send, 
  Mail, 
  Truck, 
  Clock, 
  ExternalLink,
  Search,
  X,
  CheckCircle2,
  Eye,
  Copy,
  Check,
  Radio,
  FileText,
  ShieldCheck,
  Sparkles,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ResponseActivityPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getResponseTasks();
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Failed to load response tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Handle escape to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setSelectedTask(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopyContent = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const channelOptions = [
    { value: 'all', label: 'All Channels' },
    { value: 'telegram', label: 'Telegram Bot', dotColor: '#0ea5e9' },
    { value: 'email', label: 'Email Dispatch', dotColor: '#ea580c' },
    { value: 'radio', label: 'VHF Radio / Field', dotColor: '#8b5cf6' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'dispatched', label: 'Dispatched (Executed)', dotColor: '#10b981' },
    { value: 'pending', label: 'Pending Execution', dotColor: '#f59e0b' },
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (channelFilter !== 'all' && t.channel?.toLowerCase() !== channelFilter) {
        return false;
      }
      if (statusFilter !== 'all' && t.status?.toLowerCase() !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesId = t.task_id?.toLowerCase().includes(q);
        const matchesInc = t.incident_id?.toLowerCase().includes(q);
        const matchesTarget = t.target?.toLowerCase().includes(q);
        const matchesContent = t.content?.toLowerCase().includes(q);
        const matchesTeam = t.assigned_team?.toLowerCase().includes(q);
        if (!matchesId && !matchesInc && !matchesTarget && !matchesContent && !matchesTeam) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, channelFilter, statusFilter, search]);

  const telegramCount = tasks.filter((t) => t.channel?.toLowerCase() === 'telegram').length;
  const emailCount = tasks.filter((t) => t.channel?.toLowerCase() === 'email').length;

  const hasActiveFilters = search.trim() !== '' || channelFilter !== 'all' || statusFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setChannelFilter('all');
    setStatusFilter('all');
  };

  const getChannelBadge = (ch) => {
    switch (ch?.toLowerCase()) {
      case 'telegram':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 9px',
              borderRadius: '999px',
              background: '#e0f2fe',
              color: '#0284c7',
              border: '1px solid #bae6fd',
              fontSize: '0.74rem',
              fontWeight: 700,
            }}
          >
            <Send size={12} color="#0284c7" />
            <span>Telegram</span>
          </span>
        );
      case 'email':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 9px',
              borderRadius: '999px',
              background: '#ffedd5',
              color: '#c2410c',
              border: '1px solid #fed7aa',
              fontSize: '0.74rem',
              fontWeight: 700,
            }}
          >
            <Mail size={12} color="#ea580c" />
            <span>Email</span>
          </span>
        );
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 9px',
              borderRadius: '999px',
              background: '#f3e8ff',
              color: '#7e22ce',
              border: '1px solid #e9d5ff',
              fontSize: '0.74rem',
              fontWeight: 700,
            }}
          >
            <Truck size={12} color="#9333ea" />
            <span>{ch || 'Radio'}</span>
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={22} color="var(--rama-green)" />
            <span className="heading-cursive-multicolor">Automated Response & Dispatch Activity</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Live dispatch tasks executed autonomously by n8n orchestrator upon human operator authorization
          </p>
        </div>

        <button onClick={loadTasks} className="btn btn-secondary">
          <RotateCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary Stat Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div
          className="eoc-card"
          style={{
            padding: '14px 18px',
            background: '#ffffff',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 2px 8px rgba(0, 50, 70, 0.04)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#e6f9f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Activity size={20} color="var(--rama-green)" />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Executed Tasks
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--peacock-deep)', lineHeight: 1.2 }}>
              {tasks.length}
            </div>
          </div>
        </div>

        <div
          className="eoc-card"
          style={{
            padding: '14px 18px',
            background: '#ffffff',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 2px 8px rgba(0, 50, 70, 0.04)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Send size={20} color="#0284c7" />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Telegram Broadcasts
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7', lineHeight: 1.2 }}>
              {telegramCount}
            </div>
          </div>
        </div>

        <div
          className="eoc-card"
          style={{
            padding: '14px 18px',
            background: '#ffffff',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 2px 8px rgba(0, 50, 70, 0.04)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#ffedd5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Mail size={20} color="#ea580c" />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Email Notifications
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ea580c', lineHeight: 1.2 }}>
              {emailCount}
            </div>
          </div>
        </div>

        <div
          className="eoc-card"
          style={{
            padding: '14px 18px',
            background: '#ffffff',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 2px 8px rgba(0, 50, 70, 0.04)',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={20} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Automation Success
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', lineHeight: 1.2 }}>
              100%
            </div>
          </div>
        </div>
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
            placeholder="Search by Task ID, incident, or target..."
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
            label="Channel:"
            value={channelFilter}
            onChange={setChannelFilter}
            options={channelOptions}
            minWidth="150px"
          />

          <ModeledSelect
            label="Status:"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            minWidth="160px"
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

      {/* Tasks Table Card */}
      <div className="eoc-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '14px' }}>
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fcfdfd',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--peacock-deep)' }}>
              Live Automated Dispatch Queue
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '999px',
                background: '#e6f9f5',
                color: '#0f766e',
                fontWeight: 700,
              }}
            >
              {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span>n8n Webhook Engine Ready</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading response tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No response tasks match your query. Authorize an emergency in the Approval Center to trigger automated dispatches!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="eoc-table">
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Incident</th>
                  <th>Channel</th>
                  <th>Assigned Unit / Destination</th>
                  <th>Dispatch Content Preview</th>
                  <th>Execution Status</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.task_id}>
                    {/* Task ID */}
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--peacock-deep)' }}>
                      <span
                        style={{
                          background: '#f1f5f9',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.76rem',
                        }}
                      >
                        {task.task_id}
                      </span>
                    </td>

                    {/* Incident Link */}
                    <td>
                      <Link
                        to={`/incidents/${task.incident_id}`}
                        style={{
                          color: '#0f766e',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.84rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>{task.incident_id}</span>
                        <ExternalLink size={11} color="var(--text-muted)" />
                      </Link>
                    </td>

                    {/* Channel Badge */}
                    <td>{getChannelBadge(task.channel)}</td>

                    {/* Target / Assigned Unit */}
                    <td>
                      <div>
                        {task.assigned_team && (
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--peacock-deep)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                            <Truck size={12} color="var(--rama-green)" />
                            <span>{task.assigned_team}</span>
                          </div>
                        )}
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
                          {task.target}
                        </div>
                      </div>
                    </td>

                    {/* Dispatch Content Preview - High Contrast & Clickable */}
                    <td
                      onClick={() => setSelectedTask(task)}
                      style={{
                        maxWidth: '300px',
                        fontSize: '0.82rem',
                        color: '#334155', // Crisp readable dark slate color
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer',
                      }}
                      title="Click to expand full message"
                    >
                      <span style={{ borderBottom: '1px dotted #94a3b8' }}>
                        {task.content}
                      </span>
                    </td>

                    {/* Execution Status */}
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#047857',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '3px 9px',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                        <span>DISPATCHED</span>
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(task.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    {/* Action Button */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedTask(task)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          background: '#e6f9f5',
                          border: '1px solid #99f6e4',
                          color: '#0f766e',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ccfbf1';
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(13, 148, 136, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#e6f9f5';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modeled Inspection Modal */}
      {selectedTask && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            animation: 'fadeIn 0.15s ease-out',
          }}
          onClick={() => setSelectedTask(null)}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 20px 40px -10px rgba(0, 50, 70, 0.25)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 className="heading-cursive-multicolor" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    Dispatch Task Trace
                  </h3>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      background: '#f1f5f9',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: 'var(--peacock-deep)',
                    }}
                  >
                    {selectedTask.task_id}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Triggered by Incident{' '}
                  <Link to={`/incidents/${selectedTask.incident_id}`} style={{ color: '#0f766e', fontWeight: 700 }}>
                    {selectedTask.incident_id}
                  </Link>
                </div>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CHANNEL</div>
                <div style={{ marginTop: '4px' }}>{getChannelBadge(selectedTask.channel)}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>EXECUTION STATUS</div>
                <div style={{ marginTop: '4px', fontSize: '0.82rem', fontWeight: 700, color: '#047857' }}>
                  Dispatched &bull; Verified
                </div>
              </div>
            </div>

            {/* Assigned Unit & Target Destination */}
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>DESTINATION RECIPIENT</div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--peacock-deep)', marginTop: '2px' }}>
                  {selectedTask.target}
                </div>
              </div>

              {selectedTask.assigned_team && (
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>ASSIGNED FIELD UNIT</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f766e', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Truck size={14} />
                    <span>{selectedTask.assigned_team}</span>
                  </div>
                </div>
              )}

              {selectedTask.resources && selectedTask.resources.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>DEPLOYED RESOURCES</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {selectedTask.resources.map((r, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#e6f9f5',
                          color: '#0f766e',
                          border: '1px solid #99f6e4',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}
                      >
                        {r.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Full Message Body */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--peacock-deep)' }}>
                  Dispatched Message Payload
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyContent(selectedTask.content)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.74rem',
                    color: copied ? '#10b981' : '#0f766e',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied!' : 'Copy Payload'}</span>
                </button>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '14px',
                  fontSize: '0.84rem',
                  color: '#1e293b',
                  lineHeight: '1.5',
                  wordBreak: 'break-word',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {selectedTask.content}
              </div>
            </div>

            {/* Timestamp & Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              <div>
                Dispatched at {new Date(selectedTask.timestamp).toLocaleString()}
              </div>

              <Link
                to={`/incidents/${selectedTask.incident_id}`}
                className="btn btn-primary"
                style={{ fontSize: '0.78rem', padding: '6px 14px', gap: '6px' }}
              >
                <span>Go to Incident</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResponseActivityPage;
