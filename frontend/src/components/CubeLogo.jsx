import React from 'react';

export function CubeLogo({ size = 38 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Top Face */}
      <polygon
        points="50,12 86,32 50,52 14,32"
        fill="#2dd4bf"
      />
      {/* Left Face */}
      <polygon
        points="14,35 50,55 50,92 14,72"
        fill="#0d9488"
      />
      {/* Right Face */}
      <polygon
        points="50,55 86,35 86,72 50,92"
        fill="#005b82"
      />
      {/* White internal line accents */}
      <polyline
        points="50,52 50,92"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeOpacity="0.4"
      />
      <polyline
        points="14,33 50,53 86,33"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeOpacity="0.4"
      />
    </svg>
  );
}

export default CubeLogo;
