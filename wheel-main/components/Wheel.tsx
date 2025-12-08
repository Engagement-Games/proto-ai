'use client';

import { useState } from 'react';

interface WheelProps {
  numSegments: number;
}

// Helper functions (polarToCartesian, describeArc) are unchanged...
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => { const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0; return { x: centerX + radius * Math.cos(angleInRadians), y: centerY + radius * Math.sin(angleInRadians) }; };
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number): string => { const start = polarToCartesian(x, y, radius, endAngle); const end = polarToCartesian(x, y, radius, startAngle); const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'; const d = ['M', x, y, 'L', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y, 'Z'].join(' '); return d; };

const COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#38bdf8'];

export default function Wheel({ numSegments }: WheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spinWheel = () => {
    if (isSpinning) return;
    const randomAngle = Math.random() * 360;
    const newRotation = rotation + 3600 + randomAngle;
    setIsSpinning(true);
    setRotation(newRotation);
  };
  
  const handleTransitionEnd = () => {
    setIsSpinning(false);
  };
  
  const size = 300;
  const center = size / 2;
  const radius = size / 2 - 10;
  const segmentAngle = 360 / numSegments; 

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* The Spinning Part (Segments) */}
      <div
        // ==========================================================
        // ==> FIX #1: The `shadow-lg` class has been removed from here.
        // ==========================================================
        className="relative w-full h-full rounded-full"
        onClick={spinWheel}
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 6s cubic-bezier(0.25, 0.1, 0.25, 1)',
          cursor: isSpinning ? 'not-allowed' : 'pointer',
        }}
      >
        <svg
          width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}
          className="rounded-full"
        >
          <g>
            {Array.from({ length: numSegments }).map((_, i) => {
              const startAngle = i * segmentAngle;
              const endAngle = (i + 1) * segmentAngle;
              const textAngle = startAngle + segmentAngle / 2;
              const textPosition = polarToCartesian(center, center, radius / 1.5, textAngle);

              return (
                <g key={i}>
                  <path 
                    d={describeArc(center, center, radius, startAngle, endAngle)} 
                    fill={COLORS[i % COLORS.length]} 
                    // ==========================================================
                    // ==> FIX #2: The stroke (border) is now transparent.
                    // ==========================================================
                    stroke="transparent" 
                    strokeWidth="0" 
                  />
                  <text x={textPosition.x} y={textPosition.y} fill="#171717" fontSize="20" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${textAngle + 90}, ${textPosition.x}, ${textPosition.y})`}>
                    {i + 1}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
