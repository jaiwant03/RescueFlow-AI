import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { Link } from 'react-router-dom';
import { ExternalLink, Users, MapPin } from 'lucide-react';

// Create custom glowing tactical map marker
function createCustomMarkerIcon(priorityLevel) {
  const colors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#10b981',
  };
  const color = colors[priorityLevel?.toLowerCase()] || '#10b981';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background-color: ${color};
        border: 2px solid #ffffff;
        box-shadow: 0 0 14px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ffffff;
        "></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export function IncidentMap({ incidents = [], selectedIncident = null, height = '400px' }) {
  // Default centered around Coimbatore emergency operations area
  const defaultCenter = [11.0168, 76.9558];
  
  // Filter incidents that have valid coordinates
  const validIncidents = incidents.filter(i => i.latitude && i.longitude);

  return (
    <div style={{ height, width: '100%', position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validIncidents.map((inc) => (
          <Marker
            key={inc.incident_id}
            position={[inc.latitude, inc.longitude]}
            icon={createCustomMarkerIcon(inc.priority_level)}
          >
            <Popup>
              <div style={{ padding: '6px', minWidth: '190px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--peacock-deep)' }}>
                    {inc.incident_id}
                  </span>
                  <PriorityBadge level={inc.priority_level} score={inc.priority_score} />
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', textTransform: 'capitalize', color: 'var(--peacock-deep)' }}>
                  {inc.type} Incident
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                  <MapPin size={13} color="var(--peacock-primary)" /> {inc.location}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                  <Users size={13} color="var(--rama-green)" /> {inc.people_affected || 0} Affected ({inc.report_count} reports)
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                  <StatusBadge status={inc.status} />
                  <Link
                    to={`/incidents/${inc.incident_id}`}
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--peacock-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Details <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedIncident && selectedIncident.latitude && (
          <RecenterMap center={[selectedIncident.latitude, selectedIncident.longitude]} />
        )}
      </MapContainer>

      {/* Map Legend Overlay on Bottom-Left */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(6px)',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '6px 14px',
          fontSize: '0.74rem',
          fontWeight: 700,
          color: '#0f2738',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          display: 'flex',
          gap: '12px',
          zIndex: 1000,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} /> Critical
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ea580c' }} /> High
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} /> Medium
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Low
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} /> Resolved
        </span>
      </div>
    </div>


  );
}

export default IncidentMap;
