import React from 'react';
import type { LadderRung } from '../types/Game';

interface LadderCanvasProps {
  playerCount: number;
  height: number;
  rungs: LadderRung[];
  cellWidth: number;
  cellHeight: number;
  pathsToShow?: number[][];
  currentStep?: number;
}

const LadderCanvas: React.FC<LadderCanvasProps> = ({
  playerCount,
  height,
  rungs,
  cellWidth,
  cellHeight,
  pathsToShow = [],
  currentStep = 0
}) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffd93d'];

  const renderPathLine = (path: number[], playerIndex: number) => {
    if (path.length < 2 || currentStep === 0) return null;

    const pathSegments = [];
    const stepLimit = Math.min(currentStep + 1, path.length);

    for (let i = 0; i < stepLimit - 1; i++) {
      const x1 = path[i] * cellWidth + cellWidth / 2;
      const y1 = i * cellHeight + cellHeight / 2;
      const x2 = path[i + 1] * cellWidth + cellWidth / 2;
      const y2 = (i + 1) * cellHeight + cellHeight / 2;

      pathSegments.push(
        <line
          key={`path-${playerIndex}-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={colors[playerIndex % colors.length]}
          strokeWidth="3"
          strokeDasharray="5,3"
          className="path-line active"
          opacity={0.8}
        />
      );
    }

    return pathSegments;
  };
  return (
    <svg
      width={playerCount * cellWidth}
      height={height * cellHeight}
      className="ladder-canvas"
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
    >
      {/* Vertical lines */}
      {Array.from({ length: playerCount }, (_, i) => (
        <line
          key={`vertical-${i}`}
          x1={i * cellWidth + cellWidth / 2}
          y1={0}
          x2={i * cellWidth + cellWidth / 2}
          y2={height * cellHeight}
          stroke="#8B4513"
          strokeWidth="3"
        />
      ))}

      {/* Horizontal rungs */}
      {rungs.map((rung, index) => (
        <line
          key={`rung-${index}`}
          x1={rung.left * cellWidth + cellWidth / 2}
          y1={rung.level * cellHeight}
          x2={rung.right * cellWidth + cellWidth / 2}
          y2={rung.level * cellHeight}
          stroke="#8B4513"
          strokeWidth="3"
        />
      ))}

      {/* Path visualization */}
      {pathsToShow.map((path, index) => renderPathLine(path, index))}
    </svg>
  );
};

export default LadderCanvas;