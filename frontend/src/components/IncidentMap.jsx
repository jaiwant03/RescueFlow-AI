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
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    {inc.incident_id}
                  </span>
                  <PriorityBadge level={inc.priority_level} score={inc.priority_score} />
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px', textTransform: 'capitalize' }}>
                  {inc.type} Incident
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>
                  <MapPin size={12} /> {inc.location}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '8px' }}>
                  <Users size={12} /> {inc.people_affected || 0} People Affected ({inc.report_count} reports)
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid #334155', paddingTop: '8px' }}>
                  <StatusBadge status={inc.status} />
                  <Link
                    to={`/incidents/${inc.incident_id}`}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#06b6d4',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Details <ExternalLink size={11} />
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

      {/* Map Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(4px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '0.72rem',
          display: 'flex',
          gap: '12px',
          zIndex: 1000,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Critical
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} /> High
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} /> Medium
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Low
        </span>
      </div>
    </div>
  );
}

export default IncidentMap;
