import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { 
  X, 
  Upload, 
  Trash2, 
  Camera, 
  Shield, 
  User, 
  Mail, 
  Building, 
  Radio, 
  BadgeCheck, 
  Check, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export function EditProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const { addToast } = useSystem();
  const fileInputRef = useRef(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('Operations Commander');
  const [department, setDepartment] = useState('');
  const [callsign, setCallsign] = useState('');
  const [badge, setBadge] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState(null);

  // UI state
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state whenever modal opens or user changes
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setRole(user.role || 'Operations Commander');
      setDepartment(user.department || 'Disaster Operations Command (HQ)');
      setCallsign(user.callsign || 'COMMAND-1');
      setBadge(user.badge || 'EOC-7701');
      setEmail(user.email || '');
      setPhoto(user.photo || null);
      setErrorMessage('');
    }
  }, [user, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const getInitials = (n) => {
    if (!n) return 'OP';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  // Convert and optimize image using Canvas to ensure low storage size and high fidelity
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const TARGET_SIZE = 360; // Optimal square resolution
          const width = img.width;
          const height = img.height;

          // Crop square from center
          const minSide = Math.min(width, height);
          const startX = (width - minSide) / 2;
          const startY = (height - minSide) / 2;

          canvas.width = TARGET_SIZE;
          canvas.height = TARGET_SIZE;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(
            img,
            startX,
            startY,
            minSide,
            minSide,
            0,
            0,
            TARGET_SIZE,
            TARGET_SIZE
          );

          // Convert to lightweight data URL (JPEG ~35-50KB)
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setPhoto(optimizedDataUrl);
        } catch (e) {
          console.error('Failed to optimize image', e);
          setPhoto(readerEvent.target.result);
        }
      };
      img.onerror = () => {
        setErrorMessage('Failed to decode the image file.');
      };
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    setTimeout(() => {
      try {
        updateProfile({
          name: name.trim(),
          role,
          department: department.trim(),
          callsign: callsign.trim(),
          badge: badge.trim(),
          email: email.trim(),
          photo,
        });

        addToast(
          'Profile Updated',
          'Operator profile photo and credentials saved successfully.',
          'info'
        );
        setIsSaving(false);
        onClose();
      } catch (err) {
        console.error('Save failed', err);
        setErrorMessage('Failed to save profile changes. Please try again.');
        setIsSaving(false);
      }
    }, 200);
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
        animation: 'fadeIn 0.18s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 91, 130, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.9)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          animation: 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Top Gradient Stripe */}
        <div
          style={{
            height: '4px',
            width: '100%',
            background: 'linear-gradient(90deg, #0d9488 0%, #0077b6 50%, #8b5cf6 100%)',
          }}
        />

        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ccfbf1 0%, #e0f2fe 100%)',
                border: '1px solid #99f6e4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f766e',
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Edit Operator Profile
              </h2>
              <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '2px 0 0 0', fontWeight: 500 }}>
                Update tactical clearance credentials and custom profile photo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                color: '#dc2626',
                fontSize: '0.80rem',
                fontWeight: 600,
                marginBottom: '18px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Profile Photo Uploader Section */}
          <div
            style={{
              padding: '18px',
              background: '#f8fafc',
              border: `2px dashed ${isDragOver ? '#0d9488' : '#e2e8f0'}`,
              borderRadius: '14px',
              marginBottom: '20px',
              transition: 'all 0.15s ease',
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Camera size={14} color="#0d9488" />
              <span>Tactical Profile Photo</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* Circular Avatar Preview with Camera Badge */}
              <div
                style={{
                  position: 'relative',
                  width: '92px',
                  height: '92px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Click to select new photo"
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0077b6 0%, #0d9488 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1.75rem',
                    overflow: 'hidden',
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 16px rgba(0, 119, 182, 0.25)',
                  }}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt="Profile preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    getInitials(name)
                  )}
                </div>

                {/* Camera Overlay Icon */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '0px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#0d9488',
                    color: '#ffffff',
                    border: '2px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  <Camera size={14} />
                </div>
              </div>

              {/* Upload Controls */}
              <div style={{ flex: 1, minWidth: '220px' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.80rem',
                      fontWeight: 700,
                      color: '#0f766e',
                      background: '#ccfbf1',
                      border: '1px solid #99f6e4',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#0d9488';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ccfbf1';
                      e.currentTarget.style.color = '#0f766e';
                    }}
                  >
                    <Upload size={14} />
                    <span>Upload Photo</span>
                  </button>

                  {photo && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        color: '#dc2626',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fee2e2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fef2f2';
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                  PNG, JPG, or WebP. Automatically optimized & saved across all logins.
                </div>
              </div>
            </div>
          </div>

          {/* Form Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {/* Operator Name */}
            <div style={{ gridColumn: 'span 2' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '6px',
                }}
              >
                Operator Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>

            {/* Tactical Clearance / Role */}
            <div style={{ gridColumn: 'span 2' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '6px',
                }}
              >
                Tactical Clearance Role
              </label>
              <div style={{ position: 'relative' }}>
                <Shield
                  size={16}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    color: '#0f172a',
                    background: '#ffffff',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                >
                  <option value="Operations Commander">Operations Commander (HQ Lead)</option>
                  <option value="Tactical Supervisor">Tactical Supervisor (Field Command)</option>
                  <option value="Field Dispatch Officer">Field Dispatch Officer (EMS & Logistics)</option>
                  <option value="Emergency Medical Officer">Emergency Medical Officer</option>
                  <option value="Tactical Rescue Specialist">Tactical Rescue Specialist</option>
                </select>
              </div>
            </div>

            {/* Tactical Callsign */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '6px',
                }}
              >
                Radio Callsign
              </label>
              <div style={{ position: 'relative' }}>
                <Radio
                  size={16}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  placeholder="e.g. COMMAND-1"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>

            {/* Badge / ID */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '6px',
                }}
              >
                Badge / Service ID
              </label>
              <div style={{ position: 'relative' }}>
                <BadgeCheck
                  size={16}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. EOC-7701"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>

            {/* Department */}
            <div style={{ gridColumn: 'span 2' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '6px',
                }}
              >
                Department / Agency
              </label>
              <div style={{ position: 'relative' }}>
                <Building
                  size={16}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Disaster Operations Command (HQ)"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>

            {/* Tactical Email */}
            <div style={{ gridColumn: 'span 2' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '6px',
                }}
              >
                Tactical Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. commander@rescueflow.ai"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.86rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0d9488'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#64748b',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.color = '#334155';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #0d9488 0%, #0077b6 100%)',
                boxShadow: '0 3px 10px rgba(13, 148, 136, 0.3)',
                border: 'none',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.boxShadow = '0 5px 16px rgba(13, 148, 136, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(13, 148, 136, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <Check size={16} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default EditProfileModal;
