import React from 'react';

export function LandscapeArtwork({ width = '100%', height = '100px', opacity = 0.85 }) {
  return (
    <svg
      viewBox="0 0 600 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width, height, display: 'block', opacity }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="mountainsGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#99f6e4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ccfbf1" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="mountainsGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="treesGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d9488" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0f766e" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="treesGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f766e" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#115e59" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Far Distant Mountains */}
      <path
        d="M0 140 L0 80 Q100 40 200 70 T400 45 T600 65 L600 140 Z"
        fill="url(#mountainsGrad1)"
      />

      {/* Mid Mountains */}
      <path
        d="M0 140 L0 95 Q120 60 250 85 T500 65 T600 90 L600 140 Z"
        fill="url(#mountainsGrad2)"
      />

      {/* Pine Trees Silhouette Back Row */}
      <path
        d="
          M0 140 L0 115 
          L15 90 L30 115 
          L45 85 L60 115 
          L75 92 L90 118 
          L110 80 L130 118 
          L150 95 L170 120 
          L190 75 L210 118 
          L230 88 L250 120 
          L270 82 L290 118 
          L310 92 L330 120 
          L350 78 L370 118 
          L390 85 L410 120 
          L430 72 L450 118 
          L470 86 L490 120 
          L510 75 L530 118 
          L550 85 L570 120 
          L585 92 L600 115 L600 140 Z
        "
        fill="url(#treesGrad1)"
      />

      {/* Pine Trees Silhouette Foreground Row */}
      <path
        d="
          M0 140 L0 125 
          L20 102 L40 128 
          L65 98 L90 130 
          L115 105 L140 130 
          L175 95 L205 132 
          L240 102 L275 130 
          L305 96 L335 130 
          L375 92 L405 132 
          L445 100 L475 132 
          L515 95 L545 130 
          L575 102 L600 128 L600 140 Z
        "
        fill="url(#treesGrad2)"
      />
    </svg>
  );
}

export default LandscapeArtwork;
