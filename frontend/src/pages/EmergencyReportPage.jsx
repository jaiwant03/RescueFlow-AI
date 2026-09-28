import React, { useState } from 'react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { ModeledSelect } from '../components/ModeledSelect';
import { 
  Send, 
  Upload, 
  MapPin, 
  Navigation, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Radio,
  Waves,
  Flame,
  HeartPulse,
  Zap,
  User,
  Phone,
  RotateCcw,
  ArrowRight
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
        <h2 style={{ fontSize: '1.45rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Send size={22} color="var(--rama-green)" />
          <span className="heading-cursive-multicolor">Emergency Ingestion Gateway</span>
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Submit single simulated citizen reports or import multi-channel CSV batches
        </p>
      </div>

      {/* Modeled Segmented Tabs */}
      <div
        style={{
          display: 'inline-flex',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          gap: '4px',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          onClick={() => setTab('form')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9px',
            fontSize: '0.84rem',
            fontWeight: tab === 'form' ? 700 : 600,
            background: tab === 'form' ? '#ffffff' : 'transparent',
            color: tab === 'form' ? '#0f766e' : '#64748b',
            boxShadow: tab === 'form' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={15} color={tab === 'form' ? 'var(--rama-green)' : 'currentColor'} />
          <span>Single Incident Dispatch</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('csv')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '9px',
            fontSize: '0.84rem',
            fontWeight: tab === 'csv' ? 700 : 600,
            background: tab === 'csv' ? '#ffffff' : 'transparent',
            color: tab === 'csv' ? '#0f766e' : '#64748b',
            boxShadow: tab === 'csv' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Upload size={15} color={tab === 'csv' ? 'var(--rama-green)' : 'currentColor'} />
          <span>CSV Batch Ingestion</span>
        </button>
      </div>

      {/* TAB 1: SINGLE REPORT FORM */}
      {tab === 'form' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Incident Scenario Presets Card */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(230, 249, 245, 0.7) 0%, rgba(240, 249, 255, 0.7) 100%)',
              border: '1px solid #ccfbf1',
              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.05)',
            }}
          >
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#0f766e',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Zap size={14} color="var(--rama-green)" /> Quick Emergency Scenario Presets (1-Click Fill)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleApplyTemplate({
                  name: 'Ramesh Kumar',
                  location: 'PSG College, Coimbatore',
                  message: 'URGENT! Flood water has entered houses near PSG College. Three people are trapped and need rescue.',
                  source: 'telegram',
                  lat: 11.0248,
                  lng: 77.0028
                })}
                style={{
                  background: '#ffffff',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--rama-green)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(13, 148, 136, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#bbf7d0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Waves size={16} color="#0284c7" />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--peacock-deep)' }}>
                    Flash Flood Rescue
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    PSG College &bull; Trapped Citizens
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTemplate({
                  name: 'Priya Sundaram',
                  location: 'Gandhipuram Bus Stand',
                  message: 'Fire reported near Gandhipuram bus stand. Several people are trapped inside the building.',
                  source: 'web',
                  lat: 11.0168,
                  lng: 76.9674
                })}
                style={{
                  background: '#ffffff',
                  border: '1px solid #fed7aa',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#f97316';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(249, 115, 22, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#fed7aa';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Flame size={16} color="#ea580c" />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--peacock-deep)' }}>
                    Structural Fire
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Gandhipuram Commercial Area
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTemplate({
                  name: 'Dr. Ananya Sharma',
                  location: 'RS Puram',
                  message: 'An elderly person requires urgent medical assistance near RS Puram.',
                  source: 'email',
                  lat: 11.0085,
                  lng: 76.9489
                })}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e9d5ff',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9333ea';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(147, 51, 234, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e9d5ff';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HeartPulse size={16} color="#9333ea" />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--peacock-deep)' }}>
                    Urgent Medical Trauma
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    RS Puram Residential Ward
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div
            className="eoc-card"
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0, 50, 70, 0.05)',
            }}
          >
            <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Message Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--peacock-deep)' }}>
                    Emergency Situation Description <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.72rem',
                      background: '#e6f9f5',
                      color: '#0f766e',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontWeight: 700,
                    }}
                  >
                    <Sparkles size={12} /> Groq AI Triage Pipeline
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what happened, hazards present, number of people in danger, and immediate assistance required..."
                  style={{
                    width: '100%',
                    minHeight: '110px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    background: '#ffffff',
                    transition: 'all 0.15s ease',
                    resize: 'vertical',
                    lineHeight: '1.5',
                  }}
                />
              </div>

              {/* Location & GPS Coordinates */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--peacock-deep)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="var(--rama-green)" /> Incident Location & Geo-Coordinates
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                      Location / Landmark Hint
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <MapPin size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        placeholder="E.g., Near PSG College, Gandhipuram"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        style={{ width: '100%', paddingLeft: '32px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                      Latitude (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="11.0248"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                      Longitude (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="77.0028"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGetLocation}
                    style={{
                      height: '38px',
                      padding: '0 14px',
                      borderRadius: '10px',
                      background: '#e6f9f5',
                      border: '1px solid #99f6e4',
                      color: '#0f766e',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ccfbf1';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(13, 148, 136, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#e6f9f5';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    title="Detect GPS or Preset coordinates"
                  >
                    <Navigation size={13} /> Locate GPS
                  </button>
                </div>
              </div>

              {/* Reporter Info & Channel */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--peacock-deep)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="var(--rama-green)" /> Reporter Identification & Channel
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                      Reporter Name (Optional)
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <User size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        placeholder="Citizen / Officer Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '100%', paddingLeft: '32px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                      Phone / Contact
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Phone size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ width: '100%', paddingLeft: '32px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                      Simulated Channel Source
                    </label>
                    <ModeledSelect
                      value={source}
                      onChange={setSource}
                      options={[
                        { value: 'web', label: 'Web Emergency Portal', dotColor: '#0ea5e9' },
                        { value: 'telegram', label: 'Telegram Bot', dotColor: '#0284c7' },
                        { value: 'email', label: 'Gmail / Email', dotColor: '#ea4335' },
                        { value: 'radio', label: 'VHF Radio / Dispatch', dotColor: '#10b981' },
                      ]}
                      minWidth="100%"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button & Clear */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMessage('');
                    setLocation('');
                    setLatitude('');
                    setLongitude('');
                    setName('');
                    setPhone('');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.background = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <RotateCcw size={13} /> Clear Form
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '12px 32px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0d9488 0%, #0077b6 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                    transition: 'all 0.2s ease',
                    opacity: submitting ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(13, 148, 136, 0.45)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(13, 148, 136, 0.35)';
                    }
                  }}
                >
                  <Send size={16} />
                  <span>{submitting ? 'Processing via n8n & Groq AI...' : 'Dispatch Emergency Report'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Submission Result Feedback Banner */}
          {lastSubmissionResult && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={24} color="#16a34a" />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#166534' }}>
                    Emergency report ingested and classified successfully!
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '2px' }}>
                    Message ID: <strong>{lastSubmissionResult.message_id}</strong> &bull; Pipeline Action:{' '}
                    <strong style={{ color: '#0f766e', textTransform: 'uppercase' }}>
                      {lastSubmissionResult.result?.status}
                    </strong>
                    {lastSubmissionResult.result?.incident_id && ` &bull; Incident: ${lastSubmissionResult.result.incident_id}`}
                  </div>
                </div>
              </div>

              {lastSubmissionResult.result?.incident_id && (
                <Link
                  to={`/incidents/${lastSubmissionResult.result.incident_id}`}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '6px 14px', gap: '6px' }}
                >
                  <span>View Incident</span>
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CSV BATCH IMPORT */}
      {tab === 'csv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            className="eoc-card"
            style={{
              padding: '24px',
              borderRadius: '16px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0, 50, 70, 0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="var(--rama-green)" />
                <h3 className="heading-cursive-multicolor" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  Bulk Emergency CSV Ingestion
                </h3>
              </div>
              <button
                type="button"
                onClick={handleLoadDemoCSV}
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#e6f9f5',
                  border: '1px solid #99f6e4',
                  color: '#0f766e',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ccfbf1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#e6f9f5';
                }}
              >
                Load Canonical Dataset
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.5 }}>
              Import historical or batch simulated emergency reports directly into the AI classification engine. Required CSV header columns:
              <br />
              <code style={{ color: '#0f766e', background: '#e6f9f5', padding: '3px 8px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', display: 'inline-block', marginTop: '6px', fontWeight: 600 }}>
                source, message, timestamp, location
              </code>
            </p>

            <form onSubmit={handleUploadCSV}>
              <div
                style={{
                  border: '2px dashed #99f6e4',
                  borderRadius: '14px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, #fcfefe 0%, #f0fdfa 100%)',
                  marginBottom: '20px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#e6f9f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Upload size={26} color="var(--rama-green)" />
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--peacock-deep)', marginBottom: '4px' }}>
                  {csvFile ? csvFile.name : 'Select or drag & drop emergency reports CSV'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {csvFile ? `${(csvFile.size / 1024).toFixed(1)} KB` : 'Supports standard UTF-8 encoded comma-separated values'}
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="csv-input-file"
                />
                <label
                  htmlFor="csv-input-file"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: 'var(--peacock-deep)',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--rama-green)';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(13, 148, 136, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  }}
                >
                  <FileText size={14} color="var(--rama-green)" />
                  <span>{csvFile ? 'Change Selected File' : 'Browse Files'}</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={!csvFile || csvUploading}
                  style={{
                    padding: '12px 32px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0d9488 0%, #0077b6 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: (!csvFile || csvUploading) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)',
                    transition: 'all 0.2s ease',
                    opacity: (!csvFile || csvUploading) ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (csvFile && !csvUploading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(13, 148, 136, 0.45)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (csvFile && !csvUploading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(13, 148, 136, 0.35)';
                    }
                  }}
                >
                  <Upload size={16} />
                  <span>{csvUploading ? 'Processing Batch...' : 'Process CSV Batch'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* CSV Result */}
          {csvResult && (
            <div
              className="eoc-card"
              style={{
                borderLeft: '4px solid var(--rama-green)',
                background: '#ffffff',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0, 50, 70, 0.05)',
              }}
            >
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--peacock-deep)', marginBottom: '10px' }}>
                Batch Ingestion Complete: {csvResult.total_imported} Records Processed
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {csvResult.results?.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ color: r.status === 'merged' ? 'var(--accent-cyan)' : r.status === 'created' ? '#ef4444' : '#64748b', fontWeight: 700, fontSize: '0.75rem' }}>
                      [{r.status?.toUpperCase()}]
                    </span>
                    <span style={{ fontWeight: 600 }}>
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
