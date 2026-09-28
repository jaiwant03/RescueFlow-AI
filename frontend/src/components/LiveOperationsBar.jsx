import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { 
  Radio, 
  Send, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  AlertTriangle 
} from 'lucide-react';

export function LiveOperationsBar({ onRefresh }) {
  const { addToast, refreshStats, stats } = useSystem();
  const [testingIngest, setTestingIngest] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Trigger a real-time emergency intake report to demonstrate live AI classification & deduplication
  const handleTriggerRealtimeIngest = async () => {
    setTestingIngest(true);
    try {
      const sampleReports = [
        {
          source: 'telegram',
          name: 'Coimbatore Rapid Response Scout',
          message: 'CRITICAL ALERT: Flash flood rising at PSG College area. 5 people trapped on rooftop requiring immediate evacuation boat!',
          location: 'PSG College',
          latitude: 11.0248,
          longitude: 77.0028,
        },
        {
          source: 'web',
          name: 'Traffic Control Gandhipuram',
          message: 'EMERGENCY: Building fire outbreak near Gandhipuram Central Bus Stand. Multiple people reported inside, heavy smoke spreading.',
          location: 'Gandhipuram',
          latitude: 11.0168,
          longitude: 76.9674,
        },
        {
          source: 'email',
          name: 'RS Puram Medical Unit',
          message: 'Urgent medical ambulance needed near RS Puram East Street. Elderly citizen in respiratory distress after storm.',
          location: 'RS Puram',
          latitude: 11.0085,
          longitude: 76.9489,
        }
      ];

      // Pick a sample report to ingest
      const chosen = sampleReports[Math.floor(Math.random() * sampleReports.length)];

      const res = await api.submitEmergencyReport(chosen);
      addToast(
        '⚡ Live Intake Processed',
        `AI classified as ${res.result?.incident?.type?.toUpperCase() || 'EMERGENCY'} (Priority: ${res.result?.incident?.priority_level?.toUpperCase() || 'CRITICAL'}). Dispatched in real time.`,
        'critical'
      );

      if (onRefresh) onRefresh();
      refreshStats();
    } catch (err) {
      addToast('Intake Error', err.message, 'warning');
    } finally {
      setTestingIngest(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
      await refreshStats();
      addToast('Triage Synchronized', 'Live incident feed and MongoDB stats refreshed.', 'info');
    } catch (err) {
      addToast('Sync Notice', err.message, 'warning');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div
      className="eoc-card"
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-medium)',
        borderRadius: '12px',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      {/* Left: District EOC Operational Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'var(--rama-bg)',
            border: '1px solid var(--border-active)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--rama-deep)',
            flexShrink: 0,
          }}
        >
          <Radio size={22} className="animate-pulse" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="heading-cursive-multicolor" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Live Emergency Operations Command
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                background: 'var(--rama-bg)',
                color: 'var(--rama-deep)',
                border: '1px solid var(--rama-green)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--rama-green)' }} />
              STREAM ACTIVE
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={13} color="var(--peacock-primary)" /> Coimbatore District EOC
            </span>
            <span>&bull;</span>
            <span style={{ color: 'var(--text-muted)' }}>
              AI Prioritization &bull; Automated Deduplication &bull; Multi-Channel Intake
            </span>
          </div>
        </div>
      </div>

      {/* Right: Useful Operator Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Quick Realtime Test Ingestion */}
        <button
          onClick={handleTriggerRealtimeIngest}
          disabled={testingIngest}
          className="btn btn-secondary"
          style={{
            fontSize: '0.82rem',
            padding: '8px 14px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            borderColor: 'var(--rama-green)',
            color: 'var(--rama-deep)',
            background: 'var(--rama-bg)',
          }}
          title="Send a live report through the Groq AI & deduplication pipeline"
        >
          <Sparkles size={15} color="var(--rama-deep)" />
          {testingIngest ? 'Ingesting...' : 'Test Live Ingest'}
        </button>

        {/* Manual Refresh */}
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="btn btn-secondary"
          style={{
            fontSize: '0.82rem',
            padding: '8px 14px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          title="Sync live triage queue and stats"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Syncing...' : 'Sync Triage'}
        </button>

        {/* Submit Incident Report Button */}
        <Link
          to="/report"
          className="btn btn-primary"
          style={{
            fontSize: '0.84rem',
            padding: '8px 16px',
            fontWeight: 800,
            letterSpacing: '0.02em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Send size={15} />
          + Report Incident
        </Link>
      </div>
    </div>
  );
}

export default LiveOperationsBar;
