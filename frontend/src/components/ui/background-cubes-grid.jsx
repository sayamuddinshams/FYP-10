import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/format';

/**
 * BackgroundCubesGrid - 3D Isometric Geometric Cubes Grid with Ambient Illuminations
 * Renders an architectural isometric cubic lattice with interactive hover glows
 * and ambient breathing pulses tailored to RentLink's Northern Pakistan aesthetic.
 */
export function BackgroundCubesGrid({ className = '', cubeSize = 34, strokeColor = 'rgba(217, 119, 6, 0.12)' }) {
  // Generate an array of isometric cubes across a balanced grid
  const cubes = useMemo(() => {
    const list = [];
    const rows = 12;
    const cols = 22;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Stagger every other row for isometric honeycomb lattice
        const offsetX = (r % 2) * (cubeSize * 0.866);
        const x = c * (cubeSize * 1.732) + offsetX - 150;
        const y = r * (cubeSize * 1.5) - 80;

        // Give a few cubes an ambient accent glow
        const isAccent = (r * 7 + c * 13) % 19 === 0;
        const isTeal = (r * 11 + c * 5) % 23 === 0;

        list.push({
          id: `${r}-${c}`,
          x,
          y,
          isAccent,
          isTeal,
        });
      }
    }
    return list;
  }, [cubeSize]);

  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

  const w = cubeSize * 0.866;
  const h = cubeSize * 0.5;
  const d = cubeSize * 0.6;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'pointer-events-auto absolute inset-0 overflow-hidden select-none',
        className
      )}
      style={{
        maskImage: 'radial-gradient(ellipse 70% 65% at 50% 45%, #000 30%, transparent 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 45%, #000 30%, transparent 85%)',
      }}
    >
      <svg
        className="w-full h-full opacity-70"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 650"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle Ambient Radial Shimmers */}
          <radialGradient id="amberGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="tealGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </radialGradient>
        </defs>

        {cubes.map((cube) => {
          // Distance from mouse
          const dx = mousePos.x - cube.x;
          const dy = mousePos.y - cube.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const isNearMouse = dist < 140;

          // Cube geometry paths
          // Top Face: (x, y-h), (x+w, y), (x, y+h), (x-w, y)
          const topPath = `M ${cube.x} ${cube.y - h} L ${cube.x + w} ${cube.y} L ${cube.x} ${cube.y + h} L ${cube.x - w} ${cube.y} Z`;
          // Left Face: (x-w, y), (x, y+h), (x, y+h+d), (x-w, y+d)
          const leftPath = `M ${cube.x - w} ${cube.y} L ${cube.x} ${cube.y + h} L ${cube.x} ${cube.y + h + d} L ${cube.x - w} ${cube.y + d} Z`;
          // Right Face: (x, y+h), (x+w, y), (x+w, y+d), (x, y+h+d)
          const rightPath = `M ${cube.x} ${cube.y + h} L ${cube.x + w} ${cube.y} L ${cube.x + w} ${cube.y + d} L ${cube.x} ${cube.y + h + d} Z`;

          let topFill = 'rgba(255, 255, 255, 0.03)';
          let leftFill = 'rgba(255, 255, 255, 0.015)';
          let rightFill = 'rgba(255, 255, 255, 0.02)';
          let stroke = strokeColor;

          if (isNearMouse) {
            topFill = 'rgba(254, 147, 44, 0.22)';
            leftFill = 'rgba(217, 119, 6, 0.16)';
            rightFill = 'rgba(180, 83, 9, 0.18)';
            stroke = 'rgba(254, 147, 44, 0.45)';
          } else if (cube.isAccent) {
            topFill = 'rgba(245, 158, 11, 0.1)';
            leftFill = 'rgba(217, 119, 6, 0.06)';
            rightFill = 'rgba(180, 83, 9, 0.08)';
            stroke = 'rgba(245, 158, 11, 0.25)';
          } else if (cube.isTeal) {
            topFill = 'rgba(16, 185, 129, 0.08)';
            leftFill = 'rgba(5, 150, 105, 0.05)';
            rightFill = 'rgba(4, 120, 87, 0.07)';
            stroke = 'rgba(16, 185, 129, 0.2)';
          }

          return (
            <g key={cube.id} className="transition-colors duration-300">
              {/* Left Face */}
              <path
                d={leftPath}
                fill={leftFill}
                stroke={stroke}
                strokeWidth={0.75}
                strokeLinejoin="round"
              />
              {/* Right Face */}
              <path
                d={rightPath}
                fill={rightFill}
                stroke={stroke}
                strokeWidth={0.75}
                strokeLinejoin="round"
              />
              {/* Top Face */}
              <path
                d={topPath}
                fill={topFill}
                stroke={stroke}
                strokeWidth={0.75}
                strokeLinejoin="round"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default BackgroundCubesGrid;
