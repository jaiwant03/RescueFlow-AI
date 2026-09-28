import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { 
  BarChart3, 
  RotateCw, 
  PieChart, 
  Layers, 
  Clock, 
  TrendingUp,
  Flame,
  Radio,
  Send,
  Mail,
  FileSpreadsheet
} from 'lucide-react';

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading || !data) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Calculating intelligence analytics...</div>;
  }

  const { metrics, incidents_by_type, incidents_by_priority, incidents_by_status, messages_by_channel } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--peacock-deep)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={22} color="var(--rama-green)" /> Disaster Intelligence Analytics
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Deduplication efficiency, channel distribution, and response performance metrics
          </p>
        </div>

        <button onClick={loadAnalytics} className="btn btn-secondary">
          <RotateCw size={14} /> Refresh
        </button>
      </div>

      {/* Top Benchmark KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="eoc-card">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DEDUP REDUCTION EFFICIENCY</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--rama-deep)', margin: '4px 0' }}>
            {metrics.deduplication_reduction_percent}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Noise reduction into consolidated incidents
          </div>
        </div>

        <div className="eoc-card">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AVG INTAKE PROCESSING TIME</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--peacock-primary)', margin: '4px 0' }}>
            {metrics.avg_processing_time_sec}s
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Normalized, classified & extracted
          </div>
        </div>

        <div className="eoc-card">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL INGESTED REPORTS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--peacock-deep)', margin: '4px 0' }}>
            {metrics.total_reports_ingested}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Across all 4 intake channels
          </div>
        </div>

        <div className="eoc-card">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CONSOLIDATED INCIDENTS</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', margin: '4px 0' }}>
            {metrics.total_incidents}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Operational incidents under active response
          </div>
        </div>
      </div>

      {/* Visual Distribution Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Incidents by Disaster Type */}
        <div className="eoc-card">
          <div className="eoc-card-header">
            <div className="eoc-card-title">
              <PieChart size={18} color="var(--accent-cyan)" />
              <span>Incidents by Disaster Type</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(incidents_by_type).length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '20px', textAlign: 'center' }}>
                No disaster data available yet.
              </div>
            ) : (
              Object.entries(incidents_by_type).map(([type, count]) => {
                const total = metrics.total_incidents || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#ffffff' }}>
                        {type.replace('_', ' ')}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #06b6d4)', borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Priority Tier Distribution */}
        <div className="eoc-card">
          <div className="eoc-card-header">
            <div className="eoc-card-title">
              <Flame size={18} color="#ef4444" />
              <span>Priority Tier Distribution</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Critical */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>CRITICAL (80-100)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{incidents_by_priority.critical || 0}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (incidents_by_priority.critical / (metrics.total_incidents || 1)) * 100)}%`, height: '100%', background: '#ef4444' }} />
              </div>
            </div>

            {/* High */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#f97316' }}>HIGH (60-79)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{incidents_by_priority.high || 0}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (incidents_by_priority.high / (metrics.total_incidents || 1)) * 100)}%`, height: '100%', background: '#f97316' }} />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#eab308' }}>MEDIUM (30-59)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{incidents_by_priority.medium || 0}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (incidents_by_priority.medium / (metrics.total_incidents || 1)) * 100)}%`, height: '100%', background: '#eab308' }} />
              </div>
            </div>

            {/* Low */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#10b981' }}>LOW (0-29)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{incidents_by_priority.low || 0}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (incidents_by_priority.low / (metrics.total_incidents || 1)) * 100)}%`, height: '100%', background: '#10b981' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Intake Breakdown */}
      <div className="eoc-card">
        <div className="eoc-card-header">
          <div className="eoc-card-title">
            <Radio size={18} color="var(--accent-cyan)" />
            <span>Multi-Channel Ingestion Distribution</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Send size={24} color="var(--peacock-light)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TELEGRAM BOT</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--peacock-deep)' }}>{messages_by_channel.telegram || 0}</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Mail size={24} color="#ea580c" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GMAIL / EMAIL</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--peacock-deep)' }}>{messages_by_channel.email || 0}</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Radio size={24} color="var(--peacock-primary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>WEB FORM</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--peacock-deep)' }}>{messages_by_channel.web || 0}</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileSpreadsheet size={24} color="var(--rama-green)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CSV BULK UPLOAD</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--peacock-deep)' }}>{messages_by_channel.csv || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
