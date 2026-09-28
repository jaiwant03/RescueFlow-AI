import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { 
  Activity, 
  RotateCw, 
  Send, 
  Mail, 
  MessageSquare, 
  Truck, 
  Clock, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function ResponseActivityPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getChannelIcon = (ch) => {
    switch (ch?.toLowerCase()) {
      case 'telegram':
        return <Send size={16} color="#06b6d4" />;
      case 'email':
        return <Mail size={16} color="#f97316" />;
      default:
        return <Truck size={16} color="#a78bfa" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--peacock-deep)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={22} color="var(--rama-green)" /> Automated Response & Dispatch Activity
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Live dispatch tasks executed by n8n after operator authorization
          </p>
        </div>

        <button onClick={loadTasks} className="btn btn-secondary">
          <RotateCw size={14} /> Refresh
        </button>
      </div>

      {/* Tasks Table */}
      <div className="eoc-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading response tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No response tasks dispatched yet. Authorize an emergency in the Approval Center to trigger automated dispatches!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="eoc-table">
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Incident</th>
                  <th>Channel</th>
                  <th>Target Destination</th>
                  <th>Dispatch Content Preview</th>
                  <th>Simulated Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.task_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {task.task_id}
                    </td>
                    <td>
                      <Link to={`/incidents/${task.incident_id}`} style={{ color: 'var(--peacock-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {task.incident_id}
                      </Link>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {getChannelIcon(task.channel)}
                        <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{task.channel}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {task.target}
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.8rem', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.content}
                    </td>
                    <td>
                      <span
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        SIMULATED DISPATCH
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(task.timestamp).toLocaleTimeString()}
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

export default ResponseActivityPage;
