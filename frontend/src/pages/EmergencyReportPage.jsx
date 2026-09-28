import React, { useState } from 'react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { 
  Send, 
  Upload, 
  MapPin, 
  Navigation, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Radio
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function EmergencyReportPage() {
  const { addToast, refreshStats } = useSystem();
  const [tab, setTab] = useState('form'); // 'form' or 'csv'
  
  // Single Report State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [source, setSource] = useState('web');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState(null);

  // CSV Upload State
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvResult, setCsvResult] = useState(null);

  // Quick Template Injector
  const handleApplyTemplate = (tpl) => {
    setMessage(tpl.message);
    setLocation(tpl.location);
    setName(tpl.name || 'Anonymous Citizen');
    setSource(tpl.source || 'web');
    if (tpl.lat && tpl.lng) {
      setLatitude(tpl.lat);
      setLongitude(tpl.lng);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(4));
          setLongitude(pos.coords.longitude.toFixed(4));
          addToast('GPS Located', `Acquired coordinates: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`, 'info');
        },
        () => {
          // Fallback to PSG College Coimbatore demo coordinates
          setLatitude('11.0248');
          setLongitude('77.0028');
          setLocation('PSG College, Coimbatore');
          addToast('Demo Coordinates', 'Preset to Coimbatore emergency zone coordinates', 'info');
        }
      );
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setLastSubmissionResult(null);

    try {
      const payload = {
        name: name.trim() || 'Anonymous Citizen',
        phone: phone.trim() || null,
        email: email.trim() || null,
        location: location.trim() || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        source: source,
        message: message.trim(),
      };

      const res = await api.submitEmergencyReport(payload);
      setLastSubmissionResult(res);
      addToast('Report Submitted', 'Emergency message ingested and processed through AI pipeline.', 'info');
      refreshStats();

      // Clear form message
      setMessage('');
    } catch (err) {
      addToast('Submission Failed', err.message, 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadCSV = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setCsvUploading(true);
    setCsvResult(null);

    try {
      const res = await api.uploadCSV(csvFile);
      setCsvResult(res);
      addToast('CSV Batch Processed', `Successfully processed ${res.total_imported} emergency messages.`, 'info');
      refreshStats();
    } catch (err) {
      addToast('CSV Upload Failed', err.message, 'warning');
    } finally {
      setCsvUploading(false);
    }
  };

  const handleLoadDemoCSV = async () => {
    const sampleCSVContent = `source,message,timestamp,location
telegram,"URGENT! Flood water entered houses near PSG College. 5 people trapped.",2026-09-28T10:00:00,PSG College
email,"Water has entered several homes near PSG College. Residents need emergency assistance.",2026-09-28T10:03:00,PSG College
web,"PSG area is flooded. Please send rescue support.",2026-09-28T10:05:00,PSG College
telegram,"Fire reported near Gandhipuram bus stand. Several people are trapped inside.",2026-09-28T10:08:00,Gandhipuram
web,"An elderly person requires urgent medical assistance near RS Puram.",2026-09-28T10:10:00,RS Puram
email,"Good morning everyone, have a nice day.",2026-09-28T10:12:00,Coimbatore`;

    const blob = new Blob([sampleCSVContent], { type: 'text/csv' });
    const file = new File([blob], 'demo_disaster_reports.csv', { type: 'text/csv' });
    setCsvFile(file);
    addToast('Demo CSV Loaded', "Sample emergency CSV dataset ready. Click 'Process CSV Batch' to execute.", 'info');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Send size={22} color="var(--accent-cyan)" /> Emergency Ingestion Gateway
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Submit single simulated citizen reports or import multi-channel CSV batches
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <button
          onClick={() => setTab('form')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: tab === 'form' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
            color: tab === 'form' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            border: tab === 'form' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
          }}
        >
          Single Report Form
        </button>
        <button
          onClick={() => setTab('csv')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: tab === 'csv' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
            color: tab === 'csv' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            border: tab === 'csv' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
          }}
        >
          CSV Batch Import
        </button>
      </div>

      {/* TAB 1: SINGLE REPORT FORM */}
      {tab === 'form' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Preset Template Buttons */}
          <div
            className="eoc-card"
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(180deg, #10192e 0%, #0d1526 100%)',
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} /> 1-Click Demo Report Presets:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => handleApplyTemplate({
                  name: 'Ramesh Kumar',
                  location: 'PSG College, Coimbatore',
                  message: 'URGENT! Flood water has entered houses near PSG College. Three people are trapped and need rescue.',
                  source: 'telegram',
                  lat: 11.0248,
                  lng: 77.0028
                })}
              >
                Flood near PSG College (Trapped)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => handleApplyTemplate({
                  name: 'Priya Sundaram',
                  location: 'Gandhipuram Bus Stand',
                  message: 'Fire reported near Gandhipuram bus stand. Several people are trapped inside the building.',
                  source: 'web',
                  lat: 11.0168,
                  lng: 76.9674
                })}
              >
                Fire @ Gandhipuram
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => handleApplyTemplate({
                  name: 'Dr. Ananya Sharma',
                  location: 'RS Puram',
                  message: 'An elderly person requires urgent medical assistance near RS Puram.',
                  source: 'email',
                  lat: 11.0085,
                  lng: 76.9489
                })}
              >
                Medical Emergency @ RS Puram
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="eoc-card">
            <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Message Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#ffffff' }}>
                  Emergency Situation Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what happened, hazards present, number of people in danger, and immediate assistance required..."
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              {/* Location & GPS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Location / Landmark Hint
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Near PSG College, Gandhipuram"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Latitude (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="11.0248"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Longitude (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="77.0028"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="btn btn-secondary"
                  title="Detect GPS or Preset coordinates"
                  style={{ height: '42px', padding: '0 12px' }}
                >
                  <Navigation size={15} /> Locate
                </button>
              </div>

              {/* Reporter Info & Channel */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Reporter Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Citizen / Officer Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Phone / Contact
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Simulated Channel Source
                  </label>
                  <select value={source} onChange={(e) => setSource(e.target.value)} style={{ width: '100%' }}>
                    <option value="web">Web Emergency Portal</option>
                    <option value="telegram">Telegram Bot</option>
                    <option value="email">Gmail / Email</option>
                    <option value="radio">VHF Radio / Dispatch</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', fontSize: '0.95rem', fontWeight: 600 }}
                >
                  <Send size={16} /> {submitting ? 'Processing via n8n & Groq...' : 'REPORT EMERGENCY'}
                </button>
              </div>
            </form>
          </div>

          {/* Submission Result Feedback Banner */}
          {lastSubmissionResult && (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid #10b981',
                borderRadius: '10px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={24} color="#10b981" />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                    Emergency report submitted and processed successfully!
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Message ID: {lastSubmissionResult.message_id} &bull; Pipeline Result:{' '}
                    <strong style={{ color: 'var(--accent-cyan)' }}>
                      {lastSubmissionResult.result?.status?.toUpperCase()}
                    </strong>
                    {lastSubmissionResult.result?.incident_id && ` (${lastSubmissionResult.result.incident_id})`}
                  </div>
                </div>
              </div>

              {lastSubmissionResult.result?.incident_id && (
                <Link
                  to={`/incidents/${lastSubmissionResult.result.incident_id}`}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem' }}
                >
                  View Incident &rarr;
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CSV BATCH IMPORT */}
      {tab === 'csv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="eoc-card">
            <div className="eoc-card-header">
              <div className="eoc-card-title">
                <FileText size={18} color="var(--accent-cyan)" />
                <span>Bulk Emergency CSV Ingestion</span>
              </div>
              <button onClick={handleLoadDemoCSV} className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>
                Load Canonical Demo Dataset
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Import historical or batch simulated emergency reports. Required CSV header columns:
              <br />
              <code style={{ color: 'var(--accent-cyan)', background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                source, message, timestamp, location
              </code>
            </p>

            <form onSubmit={handleUploadCSV}>
              <div
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: '10px',
                  padding: '30px',
                  textAlign: 'center',
                  background: 'var(--bg-surface)',
                  marginBottom: '16px',
                }}
              >
                <Upload size={32} color="var(--accent-cyan)" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                  {csvFile ? csvFile.name : 'Select or drop emergency reports CSV'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {csvFile ? `${(csvFile.size / 1024).toFixed(1)} KB` : 'Supports standard UTF-8 encoded CSV files'}
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="csv-input-file"
                />
                <label htmlFor="csv-input-file" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                  Browse Files
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={!csvFile || csvUploading}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px' }}
                >
                  {csvUploading ? 'Processing Batch...' : 'Process CSV Batch'}
                </button>
              </div>
            </form>
          </div>

          {/* CSV Result */}
          {csvResult && (
            <div className="eoc-card" style={{ borderLeft: '4px solid #10b981' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                Batch Ingestion Complete: {csvResult.total_imported} Records Processed
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {csvResult.results?.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: r.status === 'merged' ? 'var(--accent-cyan)' : r.status === 'created' ? '#ef4444' : '#64748b', fontWeight: 700 }}>
                      [{r.status?.toUpperCase()}]
                    </span>
                    <span>
                      {r.incident_id ? `#${r.incident_id}` : ''} {r.reason ? `(${r.reason})` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EmergencyReportPage;
