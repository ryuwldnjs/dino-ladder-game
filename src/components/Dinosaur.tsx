import React from 'react';
import type { Player, Position } from '../types/Game';

interface DinosaurProps {
  player: Player;
  position: Position;
  isAnimating: boolean;
  isClimbing?: boolean;
  reaction?: string;
}

const Dinosaur: React.FC<DinosaurProps> = ({ player, position, isAnimating, isClimbing = false, reaction }) => {
  const dinosaurEmojis: { [key: string]: string } = {
    'T-Rex': '🦖',
    'Triceratops': '🦕',
    'Stegosaurus': '🦴',
    'Velociraptor': '🐉',
    'Brontosaurus': '🐲'
  };

  return (
    <div
      className={`dinosaur ${isAnimating ? 'animating' : ''} ${isClimbing ? 'climbing-dinosaur' : ''}`}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        fontSize: '36px',
        transition: isAnimating ? 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        zIndex: 10,
        textAlign: 'center',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{
        filter: `hue-rotate(${player.color}) drop-shadow(0 2px 4px rgba(0,0,0,0.3))`,
        transform: isClimbing ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.3s ease'
      }}>
        {dinosaurEmojis[player.dinosaur] || '🦖'}
      </div>
      {isClimbing && (
        <div style={{
          position: 'absolute',
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          opacity: 0.7,
          animation: 'bounce 0.5s infinite'
        }}>
          🍺
        </div>
      )}

      {reaction && (
        <div className="reaction-bubble" style={{
          position: 'absolute',
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#333',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          animation: 'reactionPop 0.8s ease-out',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          border: '1px solid #ccc',
          zIndex: 15
        }}>
          {reaction}
        </div>
      )}
    </div>
  );
};

export default Dinosaur;