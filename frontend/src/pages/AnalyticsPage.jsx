import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { DisasterLineChart } from '../components/DisasterLineChart';
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
  FileSpreadsheet,
  Activity,
  ShieldCheck,
  Zap,
  Users,
  AlertTriangle,
  LineChart
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
    return (
      <div 
        style={{ 
          padding: '60px 20px', 
          textAlign: 'center', 
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          color: '#64748b',
          boxShadow: '0 8px 24px -4px rgba(13, 148, 136, 0.06)'
        }}
      >
        <RotateCw size={26} className="spin" style={{ margin: '0 auto 12px', color: 'var(--rama-green)' }} />
        <div style={{ fontWeight: 600, fontSize: '0.94rem' }}>Computing Real-time Disaster Intelligence Metrics...</div>
      </div>
    );
  }

  const { metrics, incidents_by_type, incidents_by_priority, incidents_by_status, messages_by_channel, timeline_trend } = data;

  const totalIncidents = metrics.total_incidents || 1;
  const totalReports = metrics.total_reports_ingested || 1;

  // Find peak disaster category
  let peakType = 'None';
  let peakCount = 0;
  Object.entries(incidents_by_type || {}).forEach(([t, count]) => {
    if (count > peakCount) {
      peakCount = count;
      peakType = t;
    }
  });

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
              background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(2, 132, 199, 0.1) 100%)',
              border: '1px solid rgba(13, 148, 136, 0.25)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.15)'
            }}>
              <LineChart size={20} color="var(--rama-green)" />
            </span>
            <span className="heading-cursive-multicolor">Disaster Intelligence & Operational Analytics</span>
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px', marginBottom: 0, fontWeight: 500 }}>
            Real-time classification spline curves, deduplication efficiency, and severity trajectory metrics across operational zones
          </p>
        </div>

        <button 
          onClick={loadAnalytics} 
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
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
          <span>Re-Compute Analytics</span>
        </button>
      </div>

      {/* Top 4 Modeled Benchmark KPI Cards */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '16px' 
        }}
      >
        {/* KPI 1: Dedup Reduction */}
        <div 
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1.5px solid #ccfbf1',
            boxShadow: '0 8px 20px -4px rgba(13, 148, 136, 0.08), 0 2px 6px -1px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '3.5px', background: 'linear-gradient(90deg, #0d9488 0%, #14b8a6 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#0f766e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Dedup Noise Reduction
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#042f2e', margin: '6px 0 2px', lineHeight: 1 }}>
                {metrics.deduplication_reduction_percent}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Reports consolidated into clean alerts
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
              <TrendingUp size={22} />
            </div>
          </div>
        </div>

        {/* KPI 2: Intake Latency */}
        <div 
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1.5px solid #bae6fd',
            boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.08), 0 2px 6px -1px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '3.5px', background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Avg Processing Latency
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#082f49', margin: '6px 0 2px', lineHeight: 1 }}>
                {metrics.avg_processing_time_sec}s
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Ingestion to AI priority score
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <Zap size={22} />
            </div>
          </div>
        </div>

        {/* KPI 3: Total Ingested Reports */}
        <div 
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1.5px solid #ddd6fe',
            boxShadow: '0 8px 20px -4px rgba(139, 92, 246, 0.08), 0 2px 6px -1px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '3.5px', background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#6d28d9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Ingested Reports
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#2e1065', margin: '6px 0 2px', lineHeight: 1 }}>
                {metrics.total_reports_ingested}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Across all 4 intake pathways
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
              <Radio size={22} />
            </div>
          </div>
        </div>

        {/* KPI 4: Consolidated Incidents */}
        <div 
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1.5px solid #fed7aa',
            boxShadow: '0 8px 20px -4px rgba(249, 115, 22, 0.08), 0 2px 6px -1px rgba(0,0,0,0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '3.5px', background: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#c2410c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Consolidated Incidents
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#431407', margin: '6px 0 2px', lineHeight: 1 }}>
                {metrics.total_incidents}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Active emergency response units
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
              <ShieldCheck size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid (Line Chart on Left + Priority Breakdown on Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: '20px' }}>
        {/* Card 1: Modeled Disaster Classification Line Chart */}
        <div 
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #ccfbf1',
            boxShadow: '0 10px 25px -4px rgba(13, 148, 136, 0.08), 0 2px 6px -1px rgba(0,0,0,0.03)',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '3.5px', background: 'linear-gradient(90deg, #0d9488 0%, #0077b6 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />

          {/* Card Header with Peak Badge & Category Tag */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rama-green)' }}>
                <LineChart size={17} />
              </div>
              <div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                  Incidents by Disaster Classification
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Interactive multi-series trajectory & classification spline
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span 
                style={{ 
                  fontSize: '0.74rem', 
                  fontWeight: 700, 
                  color: '#0f766e', 
                  background: '#f0fdfa', 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  border: '1px solid #ccfbf1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0d9488' }} />
                Peak: <strong style={{ textTransform: 'capitalize' }}>{peakType}</strong> ({peakCount})
              </span>
            </div>
          </div>

          {/* Bespoke Interactive Line Chart */}
          <DisasterLineChart
            timelineData={timeline_trend}
            incidentsByType={incidents_by_type}
            totalIncidents={totalIncidents}
          />
        </div>

        {/* Card 2: Severity & Priority Tier Breakdown */}
        <div 
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #fecaca',
            boxShadow: '0 10px 25px -4px rgba(239, 68, 68, 0.08), 0 2px 6px -1px rgba(0,0,0,0.03)',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: '3.5px', background: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)', position: 'absolute', top: 0, left: 0, right: 0 }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={17} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                  Severity & Priority Tier Breakdown
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Multi-factor AI triage scoring tiers
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '4px 10px', borderRadius: '20px', border: '1px solid #fecaca' }}>
              Dynamic SLA
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
            {/* Critical */}
            <div style={{ background: '#fef2f2', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fecaca' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                  CRITICAL (Score 80 - 100)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#991b1b', background: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #fecaca', fontSize: '0.80rem' }}>
                  {incidents_by_priority.critical || 0} incidents ({Math.round(((incidents_by_priority.critical || 0) / totalIncidents) * 100)}%)
                </span>
              </div>
              <div style={{ height: '8px', background: '#fee2e2', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, ((incidents_by_priority.critical || 0) / totalIncidents) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)', borderRadius: '5px' }} />
              </div>
            </div>

            {/* High */}
            <div style={{ background: '#fff7ed', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, color: '#c2410c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} />
                  HIGH (Score 60 - 79)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#9a3412', background: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #fed7aa', fontSize: '0.80rem' }}>
                  {incidents_by_priority.high || 0} incidents ({Math.round(((incidents_by_priority.high || 0) / totalIncidents) * 100)}%)
                </span>
              </div>
              <div style={{ height: '8px', background: '#ffedd5', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, ((incidents_by_priority.high || 0) / totalIncidents) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)', borderRadius: '5px' }} />
              </div>
            </div>

            {/* Medium */}
            <div style={{ background: '#fefce8', padding: '12px 14px', borderRadius: '12px', border: '1px solid #fef08a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, color: '#a16207', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                  MEDIUM (Score 30 - 59)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#854d0e', background: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #fef08a', fontSize: '0.80rem' }}>
                  {incidents_by_priority.medium || 0} incidents ({Math.round(((incidents_by_priority.medium || 0) / totalIncidents) * 100)}%)
                </span>
              </div>
              <div style={{ height: '8px', background: '#fef9c3', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, ((incidents_by_priority.medium || 0) / totalIncidents) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #eab308 0%, #ca8a04 100%)', borderRadius: '5px' }} />
              </div>
            </div>

            {/* Low */}
            <div style={{ background: '#ecfdf5', padding: '12px 14px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  LOW (Score 0 - 29)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#065f46', background: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0', fontSize: '0.80rem' }}>
                  {incidents_by_priority.low || 0} incidents ({Math.round(((incidents_by_priority.low || 0) / totalIncidents) * 100)}%)
                </span>
              </div>
              <div style={{ height: '8px', background: '#d1fae5', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, ((incidents_by_priority.low || 0) / totalIncidents) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', borderRadius: '5px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modeled Multi-Channel Ingestion Performance Breakdown */}
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 8px 24px -4px rgba(0,0,0,0.04)',
          padding: '22px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={17} color="#8b5cf6" />
            </div>
            <span>Multi-Channel Emergency Ingestion Performance</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Total Inflow: <strong style={{ color: '#0f172a' }}>{metrics.total_reports_ingested}</strong> Dispatches
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
          {/* Telegram */}
          <div 
            style={{ 
              background: '#f0fdfa', 
              padding: '16px', 
              borderRadius: '12px', 
              border: '1.5px solid #ccfbf1', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.05)',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488', flexShrink: 0 }}>
              <Send size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#0f766e', fontWeight: 700, textTransform: 'uppercase' }}>
                Telegram Bot
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#042f2e', marginTop: '2px', lineHeight: 1 }}>
                {messages_by_channel.telegram || 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                {Math.round(((messages_by_channel.telegram || 0) / totalReports) * 100)}% of total intake
              </div>
            </div>
          </div>

          {/* Email */}
          <div 
            style={{ 
              background: '#fff7ed', 
              padding: '16px', 
              borderRadius: '12px', 
              border: '1.5px solid #fed7aa', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.05)',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', flexShrink: 0 }}>
              <Mail size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 700, textTransform: 'uppercase' }}>
                Emergency Email
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#431407', marginTop: '2px', lineHeight: 1 }}>
                {messages_by_channel.email || 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                {Math.round(((messages_by_channel.email || 0) / totalReports) * 100)}% of total intake
              </div>
            </div>
          </div>

          {/* Web Form */}
          <div 
            style={{ 
              background: '#f0f9ff', 
              padding: '16px', 
              borderRadius: '12px', 
              border: '1.5px solid #bae6fd', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.05)',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}>
              <Radio size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>
                Public Web Portal
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#082f49', marginTop: '2px', lineHeight: 1 }}>
                {messages_by_channel.web || 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                {Math.round(((messages_by_channel.web || 0) / totalReports) * 100)}% of total intake
              </div>
            </div>
          </div>

          {/* CSV Bulk Upload */}
          <div 
            style={{ 
              background: '#faf5ff', 
              padding: '16px', 
              borderRadius: '12px', 
              border: '1.5px solid #e9d5ff', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px',
              boxShadow: '0 2px 6px rgba(139, 92, 246, 0.05)',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea', flexShrink: 0 }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#7e22ce', fontWeight: 700, textTransform: 'uppercase' }}>
                CSV Batch Importer
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b0764', marginTop: '2px', lineHeight: 1 }}>
                {messages_by_channel.csv || 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                {Math.round(((messages_by_channel.csv || 0) / totalReports) * 100)}% of total intake
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
