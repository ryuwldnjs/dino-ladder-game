import React from 'react';
import type { Player, Position } from '../types/Game';

interface DinosaurProps {
  player: Player;
  position: Position;
  isAnimating: boolean;
  isClimbing?: boolean;
}

const Dinosaur: React.FC<DinosaurProps> = ({ player, position, isAnimating, isClimbing = false }) => {
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
        fontSize: '32px',
        transition: isAnimating ? 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        zIndex: 10,
        textAlign: 'center',
        width: '40px',
        height: '40px',
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
          💨
        </div>
      )}
    </div>
  );
};

export default Dinosaur;