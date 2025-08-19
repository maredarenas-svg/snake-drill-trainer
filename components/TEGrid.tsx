import React from 'react';

interface TEGridProps {
  traverse: number;
  elevation: number;
  maxTAndE: number;
}

const TEGrid: React.FC<TEGridProps> = ({ traverse, elevation, maxTAndE }) => {
  // Clamp values to prevent the reticle from going too far off-grid visually
  const clampedTraverse = Math.max(-maxTAndE, Math.min(maxTAndE, traverse));
  const clampedElevation = Math.max(-maxTAndE, Math.min(maxTAndE, elevation));

  // Calculate percentage positions for top/left. Elevation is inverted for screen coordinates.
  const leftPos = 50 + (clampedTraverse / maxTAndE) * 50;
  const topPos = 50 - (clampedElevation / maxTAndE) * 50;

  return (
    <div
      className="relative w-full aspect-square max-w-[250px] mx-auto bg-gray-900 rounded-lg border-2 border-gray-600 overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(rgba(107, 114, 128, 0.2) 1px, transparent 1px),
          linear-gradient(90deg, rgba(107, 114, 128, 0.2) 1px, transparent 1px)
        `,
        backgroundSize: '10% 10%',
      }}
      aria-label={`T&E Grid. Current position: Traverse ${traverse}, Elevation ${elevation}`}
    >
      {/* Center crosshairs */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gray-500" />
      <div className="absolute left-1/2 top-0 w-px h-full bg-gray-500" />

      {/* Reticle */}
      <div
        className="absolute w-4 h-4 -mt-2 -ml-2 rounded-full border-2 border-yellow-400 bg-yellow-400 bg-opacity-20 transition-all duration-200 ease-in-out"
        style={{
          top: `${topPos}%`,
          left: `${leftPos}%`,
        }}
        role="img"
        aria-label="Target reticle"
      >
        <div className="absolute top-1/2 left-0 w-full h-px bg-yellow-400" />
        <div className="absolute left-1/2 top-0 w-px h-full bg-yellow-400" />
      </div>
    </div>
  );
};

export default TEGrid;