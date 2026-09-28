import React, { useState, useMemo, useRef } from 'react';
import { Waves, Flame, HeartPulse, Activity, Zap, Layers, Sparkles } from 'lucide-react';

/**
 * Computes smooth cubic bezier path string from an array of {x, y} points
 */
function getSmoothPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function DisasterLineChart({
  timelineData = [],
  incidentsByType = {},
  totalIncidents = 0
}) {
  const [activeSeries, setActiveSeries] = useState({
    total: true,
    flood: true,
    fire: true,
    medical: true,
  });

  const [hoverIndex, setHoverIndex] = useState(null);
  const [viewMode, setViewMode] = useState('trend'); // 'trend' (time series) | 'distribution' (by type)
  const svgRef = useRef(null);

  // SVG Drawing dimensions
  const width = 560;
  const height = 210;
  const padding = { top: 22, right: 28, bottom: 36, left: 38 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Series configurations
  const seriesConfig = {
    total: {
      name: 'Total Trajectory',
      color: '#8b5cf6',
      gradientId: 'grad-total',
      icon: Activity,
    },
    flood: {
      name: 'Flood Emergency',
      color: '#0d9488',
      gradientId: 'grad-flood',
      icon: Waves,
    },
    fire: {
      name: 'Fire / Structural',
      color: '#ef4444',
      gradientId: 'grad-fire',
      icon: Flame,
    },
    medical: {
      name: 'Medical Trauma',
      color: '#0284c7',
      gradientId: 'grad-medical',
      icon: HeartPulse,
    },
  };

  // Prepare normalized data points for Trend mode
  const trendData = useMemo(() => {
    if (!timelineData || timelineData.length === 0) {
      // Fallback synthetic 6-step progression based on incidentsByType
      const f = incidentsByType.flood || 0;
      const r = incidentsByType.fire || 0;
      const m = incidentsByType.medical || 0;
      return [
        { time: '08:00', flood: 0, fire: 0, medical: 0, total: 0 },
        { time: '10:00', flood: Math.round(f * 0.3), fire: 0, medical: 0, total: Math.round(f * 0.3) },
        { time: '12:00', flood: Math.round(f * 0.6), fire: Math.round(r * 0.4), medical: 0, total: Math.round(f * 0.6 + r * 0.4) },
        { time: '14:00', flood: f, fire: Math.round(r * 0.8), medical: Math.round(m * 0.5), total: Math.round(f + r * 0.8 + m * 0.5) },
        { time: '16:00', flood: f, fire: r, medical: m, total: f + r + m },
        { time: '18:00', flood: f, fire: r, medical: m, total: totalIncidents || f + r + m },
      ];
    }
    return timelineData;
  }, [timelineData, incidentsByType, totalIncidents]);

  // Classification Distribution data points
  const distributionData = useMemo(() => {
    const types = ['flood', 'fire', 'medical', 'storm', 'other'];
    return types.map((t) => ({
      label: t.charAt(0).toUpperCase() + t.slice(1),
      key: t,
      count: incidentsByType[t] || 0,
      pct: totalIncidents > 0 ? Math.round(((incidentsByType[t] || 0) / totalIncidents) * 100) : 0,
    }));
  }, [incidentsByType, totalIncidents]);

  // Compute maximum Y value
  const maxY = useMemo(() => {
    if (viewMode === 'trend') {
      const maxVal = Math.max(...trendData.map((d) => d.total || 0), 3);
      return Math.ceil(maxVal * 1.25);
    } else {
      const maxVal = Math.max(...distributionData.map((d) => d.count || 0), 3);
      return Math.ceil(maxVal * 1.25);
    }
  }, [trendData, distributionData, viewMode]);

  // Map data to SVG coordinates
  const pointsBySeries = useMemo(() => {
    if (trendData.length === 0) return {};
    const stepX = chartW / (trendData.length - 1);

    const mapPoints = (key) =>
      trendData.map((d, i) => {
        const val = d[key] || 0;
        const x = padding.left + i * stepX;
        const y = padding.top + chartH - (val / maxY) * chartH;
        return { x, y, value: val, time: d.time };
      });

    return {
      total: mapPoints('total'),
      flood: mapPoints('flood'),
      fire: mapPoints('fire'),
      medical: mapPoints('medical'),
    };
  }, [trendData, chartW, chartH, maxY, padding.left, padding.top]);

  // Distribution points
  const distPoints = useMemo(() => {
    if (distributionData.length === 0) return [];
    const stepX = chartW / (distributionData.length - 1);
    return distributionData.map((d, i) => {
      const x = padding.left + i * stepX;
      const y = padding.top + chartH - (d.count / maxY) * chartH;
      return { x, y, value: d.count, label: d.label, pct: d.pct, key: d.key };
    });
  }, [distributionData, chartW, chartH, maxY, padding.left, padding.top]);

  // Handle Mouse Hover
  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const currentPoints = viewMode === 'trend' ? pointsBySeries.total : distPoints;
    if (!currentPoints || currentPoints.length === 0) return;

    let closestIdx = 0;
    let minDiff = Infinity;
    currentPoints.forEach((p, idx) => {
      const diff = Math.abs(p.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const toggleSeries = (key) => {
    setActiveSeries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Y-axis grid ticks (0, mid, max)
  const yTicks = [0, Math.round(maxY / 2), maxY];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Controls Row: View Selector + Series Toggle Pills */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        {/* Modeled View Mode Segmented Tab */}
        <div
          style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: '9px',
            border: '1px solid #e2e8f0',
            gap: '2px',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('trend')}
            style={{
              padding: '4px 12px',
              borderRadius: '7px',
              fontSize: '0.74rem',
              fontWeight: viewMode === 'trend' ? 700 : 600,
              background: viewMode === 'trend' ? '#ffffff' : 'transparent',
              color: viewMode === 'trend' ? '#0f766e' : '#64748b',
              border: 'none',
              boxShadow: viewMode === 'trend' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Hourly Trajectory Curve
          </button>
          <button
            type="button"
            onClick={() => setViewMode('distribution')}
            style={{
              padding: '4px 12px',
              borderRadius: '7px',
              fontSize: '0.74rem',
              fontWeight: viewMode === 'distribution' ? 700 : 600,
              background: viewMode === 'distribution' ? '#ffffff' : 'transparent',
              color: viewMode === 'distribution' ? '#0f766e' : '#64748b',
              border: 'none',
              boxShadow: viewMode === 'distribution' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Category Distribution Spline
          </button>
        </div>

        {/* Series Toggles (in Trend view) */}
        {viewMode === 'trend' && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {Object.entries(seriesConfig).map(([key, config]) => {
              const active = activeSeries[key];
              const count =
                key === 'total'
                  ? totalIncidents
                  : incidentsByType[key] || 0;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSeries(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 9px',
                    borderRadius: '7px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: active ? '#ffffff' : '#f8fafc',
                    color: active ? config.color : '#94a3b8',
                    border: `1.5px solid ${active ? config.color : '#e2e8f0'}`,
                    cursor: 'pointer',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
                    opacity: active ? 1 : 0.65,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: config.color,
                      display: 'inline-block',
                    }}
                  />
                  <span>
                    {key.charAt(0).toUpperCase() + key.slice(1)} ({count})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SVG Canvas Container with Modeled Lighting */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '12px',
          border: '1.5px solid #e2e8f0',
          padding: '8px 12px 4px 4px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.02)',
          userSelect: 'none',
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Soft Area Gradient Fills */}
            <linearGradient id="grad-total" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.00" />
            </linearGradient>

            <linearGradient id="grad-flood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.00" />
            </linearGradient>

            <linearGradient id="grad-fire" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.00" />
            </linearGradient>

            <linearGradient id="grad-medical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid Lines & Y-Axis Labels */}
          {yTicks.map((val) => {
            const y = padding.top + chartH - (val / maxY) * chartH;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartW}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Render Trend Curves */}
          {viewMode === 'trend' && (
            <>
              {/* Flood Curve */}
              {activeSeries.flood && pointsBySeries.flood && (
                <g>
                  <path
                    d={`${getSmoothPath(pointsBySeries.flood)} L ${padding.left + chartW} ${
                      padding.top + chartH
                    } L ${padding.left} ${padding.top + chartH} Z`}
                    fill="url(#grad-flood)"
                  />
                  <path
                    d={getSmoothPath(pointsBySeries.flood)}
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {pointsBySeries.flood.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={hoverIndex === idx ? 5 : 3.5}
                      fill="#ffffff"
                      stroke="#0d9488"
                      strokeWidth={hoverIndex === idx ? 3 : 2}
                      style={{ transition: 'r 0.15s ease' }}
                    />
                  ))}
                </g>
              )}

              {/* Fire Curve */}
              {activeSeries.fire && pointsBySeries.fire && (
                <g>
                  <path
                    d={`${getSmoothPath(pointsBySeries.fire)} L ${padding.left + chartW} ${
                      padding.top + chartH
                    } L ${padding.left} ${padding.top + chartH} Z`}
                    fill="url(#grad-fire)"
                  />
                  <path
                    d={getSmoothPath(pointsBySeries.fire)}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {pointsBySeries.fire.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={hoverIndex === idx ? 5 : 3.5}
                      fill="#ffffff"
                      stroke="#ef4444"
                      strokeWidth={hoverIndex === idx ? 3 : 2}
                      style={{ transition: 'r 0.15s ease' }}
                    />
                  ))}
                </g>
              )}

              {/* Medical Curve */}
              {activeSeries.medical && pointsBySeries.medical && (
                <g>
                  <path
                    d={`${getSmoothPath(pointsBySeries.medical)} L ${padding.left + chartW} ${
                      padding.top + chartH
                    } L ${padding.left} ${padding.top + chartH} Z`}
                    fill="url(#grad-medical)"
                  />
                  <path
                    d={getSmoothPath(pointsBySeries.medical)}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {pointsBySeries.medical.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={hoverIndex === idx ? 5 : 3.5}
                      fill="#ffffff"
                      stroke="#0284c7"
                      strokeWidth={hoverIndex === idx ? 3 : 2}
                      style={{ transition: 'r 0.15s ease' }}
                    />
                  ))}
                </g>
              )}

              {/* Total Trajectory Curve */}
              {activeSeries.total && pointsBySeries.total && (
                <g>
                  <path
                    d={`${getSmoothPath(pointsBySeries.total)} L ${padding.left + chartW} ${
                      padding.top + chartH
                    } L ${padding.left} ${padding.top + chartH} Z`}
                    fill="url(#grad-total)"
                  />
                  <path
                    d={getSmoothPath(pointsBySeries.total)}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {pointsBySeries.total.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={hoverIndex === idx ? 5.5 : 4}
                      fill="#ffffff"
                      stroke="#8b5cf6"
                      strokeWidth={hoverIndex === idx ? 3 : 2}
                      style={{ transition: 'r 0.15s ease' }}
                    />
                  ))}
                </g>
              )}
            </>
          )}

          {/* Render Distribution Spline Curve */}
          {viewMode === 'distribution' && distPoints.length > 0 && (
            <g>
              <path
                d={`${getSmoothPath(distPoints)} L ${padding.left + chartW} ${
                  padding.top + chartH
                } L ${padding.left} ${padding.top + chartH} Z`}
                fill="url(#grad-flood)"
              />
              <path
                d={getSmoothPath(distPoints)}
                fill="none"
                stroke="url(#grad-total)"
                stroke="#0d9488"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {distPoints.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoverIndex === idx ? 6 : 4.5}
                    fill="#ffffff"
                    stroke={
                      p.key === 'flood'
                        ? '#0d9488'
                        : p.key === 'fire'
                        ? '#ef4444'
                        : p.key === 'medical'
                        ? '#0284c7'
                        : '#8b5cf6'
                    }
                    strokeWidth="2.5"
                    style={{ transition: 'r 0.15s ease' }}
                  />
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#0f172a"
                    fontFamily="var(--font-mono)"
                  >
                    {p.value}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Vertical Guide Line on Hover */}
          {hoverIndex !== null && (
            <line
              x1={
                viewMode === 'trend'
                  ? pointsBySeries.total[hoverIndex]?.x
                  : distPoints[hoverIndex]?.x
              }
              y1={padding.top}
              x2={
                viewMode === 'trend'
                  ? pointsBySeries.total[hoverIndex]?.x
                  : distPoints[hoverIndex]?.x
              }
              y2={padding.top + chartH}
              stroke="#0d9488"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.7"
            />
          )}

          {/* X-Axis Labels */}
          {viewMode === 'trend'
            ? trendData.map((d, i) => {
                const stepX = chartW / (trendData.length - 1);
                const x = padding.left + i * stepX;
                return (
                  <text
                    key={i}
                    x={x}
                    y={height - 12}
                    textAnchor="middle"
                    fontSize="10"
                    fill={hoverIndex === i ? '#0d9488' : '#64748b'}
                    fontWeight={hoverIndex === i ? '700' : '500'}
                    fontFamily="var(--font-mono)"
                  >
                    {d.time}
                  </text>
                );
              })
            : distPoints.map((p, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={height - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill={hoverIndex === i ? '#0d9488' : '#64748b'}
                  fontWeight={hoverIndex === i ? '700' : '600'}
                >
                  {p.label}
                </text>
              ))}
        </svg>

        {/* Floating Modeled Glassmorphic Tooltip */}
        {hoverIndex !== null && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid #ccfbf1',
              borderRadius: '10px',
              padding: '8px 12px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: '150px',
            }}
          >
            {viewMode === 'trend' ? (
              <>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#0f766e',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '3px',
                    marginBottom: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>TIME {trendData[hoverIndex]?.time}</span>
                  <span style={{ color: '#8b5cf6' }}>
                    {trendData[hoverIndex]?.total || 0} TOTAL
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.72rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f766e' }}>
                    <span>🌊 Flood:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>
                      {trendData[hoverIndex]?.flood || 0}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>🔥 Fire:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>
                      {trendData[hoverIndex]?.fire || 0}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
                    <span>🏥 Medical:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>
                      {trendData[hoverIndex]?.medical || 0}
                    </strong>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>
                  {distPoints[hoverIndex]?.label} Emergency
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>
                  {distPoints[hoverIndex]?.value} Incidents{' '}
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                    ({distPoints[hoverIndex]?.pct}%)
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modeled Footer Stat Badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          paddingTop: '4px',
        }}
      >
        <div
          style={{
            background: '#f0fdfa',
            border: '1px solid #ccfbf1',
            borderRadius: '9px',
            padding: '7px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#0f766e', fontWeight: 700 }}>
            🌊 Flood
          </span>
          <span
            style={{
              fontSize: '0.80rem',
              fontWeight: 800,
              color: '#042f2e',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {incidentsByType.flood || 0} ({totalIncidents > 0 ? Math.round(((incidentsByType.flood || 0) / totalIncidents) * 100) : 0}%)
          </span>
        </div>

        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '9px',
            padding: '7px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 700 }}>
            🔥 Fire
          </span>
          <span
            style={{
              fontSize: '0.80rem',
              fontWeight: 800,
              color: '#991b1b',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {incidentsByType.fire || 0} ({totalIncidents > 0 ? Math.round(((incidentsByType.fire || 0) / totalIncidents) * 100) : 0}%)
          </span>
        </div>

        <div
          style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '9px',
            padding: '7px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
            🏥 Medical
          </span>
          <span
            style={{
              fontSize: '0.80rem',
              fontWeight: 800,
              color: '#082f49',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {incidentsByType.medical || 0} ({totalIncidents > 0 ? Math.round(((incidentsByType.medical || 0) / totalIncidents) * 100) : 0}%)
          </span>
        </div>
      </div>
    </div>
  );
}

export default DisasterLineChart;
