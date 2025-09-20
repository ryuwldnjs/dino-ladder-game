import React, { useState, useCallback, useEffect } from 'react';
import type { Player, GameState, Position } from '../types/Game';
import { generateValidLadder, getDetailedPath } from '../utils/ladderGenerator';
import Dinosaur from './Dinosaur';
import LadderCanvas from './LadderCanvas';

const DinosaurLadderGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    ladderHeight: 10,
    ladderRungs: [],
    gameStarted: false,
    gameFinished: false,
    results: []
  });

  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [showNameInput, setShowNameInput] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dinosaurPositions, setDinosaurPositions] = useState<Position[]>([]);
  const [climbingPaths, setClimbingPaths] = useState<number[][]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showStartEffect, setShowStartEffect] = useState(false);
  const [celebrationParticles, setCelebrationParticles] = useState<Array<{id: number, emoji: string, x: number, y: number}>>([]);

  const getCellDimensions = () => {
    const screenWidth = window.innerWidth;
    const maxWidth = Math.min(screenWidth - 40, 400); // 모바일 최적화
    const cellWidth = Math.max(60, maxWidth / playerCount); // 최소 60px
    const cellHeight = Math.max(40, cellWidth * 0.6); // 비율 유지
    return { cellWidth, cellHeight };
  };

  const { cellWidth, cellHeight } = getCellDimensions();

  const drinkingPunishments = [
    '🍺 맥주 1잔 원샷!',
    '🥃 소주 1잔 원샷!',
    '🍷 와인 1잔 원샷!',
    '🥂 건배사 하며 2잔!',
    '🎉 자유! (면제)',
    '🎪 춤추며 1잔!',
    '🎭 개인기 후 1잔!',
    '💘 러브샷 상대 지목!'
  ];

  const dinosaurTypes = ['T-Rex', 'Triceratops', 'Stegosaurus', 'Velociraptor', 'Brontosaurus'];
  const colors = ['0deg', '60deg', '120deg', '180deg', '240deg'];

  const initializePlayers = useCallback(() => {
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      name: playerNames[i] || `${dinosaurTypes[i % dinosaurTypes.length]}`,
      dinosaur: dinosaurTypes[i % dinosaurTypes.length],
      color: colors[i % colors.length]
    }));

    const rungs = generateValidLadder(playerCount, gameState.ladderHeight);

    setGameState({
      ...gameState,
      players,
      ladderRungs: rungs,
      gameStarted: false,
      gameFinished: false,
      results: []
    });

    const { cellWidth: currentCellWidth } = getCellDimensions();
    const initialPositions: Position[] = players.map((_, i) => ({
      x: i * currentCellWidth + currentCellWidth / 2 - 24,
      y: 5
    }));
    setDinosaurPositions(initialPositions);
  }, [playerCount, gameState.ladderHeight, playerNames]);

  const startGame = useCallback(() => {
    if (gameState.players.length === 0) return;

    // 게임 시작 효과 표시
    setShowStartEffect(true);
    setTimeout(() => setShowStartEffect(false), 1000);

    setGameState({ ...gameState, gameStarted: true });
    setIsAnimating(true);
    setCurrentStep(0);

    // 각 공룡의 상세 경로 계산
    const paths = gameState.players.map((_, i) =>
      getDetailedPath(i, gameState.ladderRungs, gameState.ladderHeight)
    );
    setClimbingPaths(paths);

    // 단계별 애니메이션
    const animateStep = (step: number) => {
      if (step >= gameState.ladderHeight) {
        // 애니메이션 완료
        const results = paths.map(path => path[path.length - 1]);
        setGameState({
          ...gameState,
          gameStarted: true,
          gameFinished: true,
          results
        });
        setIsAnimating(false);

        // 파티 파티클 효과 생성
        const particles = [];
        const partyParticles = ['🍻', '🎉', '🥳', '🍺', '🥃', '🍷', '🥂', '✨'];
        for (let i = 0; i < 25; i++) {
          particles.push({
            id: i,
            emoji: partyParticles[Math.floor(Math.random() * partyParticles.length)],
            x: Math.random() * window.innerWidth,
            y: window.innerHeight
          });
        }
        setCelebrationParticles(particles);

        // 3초 후 파티클 제거
        setTimeout(() => setCelebrationParticles([]), 3000);
        return;
      }

      setCurrentStep(step);

      // 현재 단계의 위치로 공룡들 이동
      const { cellWidth: currentCellWidth, cellHeight: currentCellHeight } = getCellDimensions();
      const currentPositions: Position[] = gameState.players.map((_, i) => ({
        x: paths[i][step] * currentCellWidth + currentCellWidth / 2 - 24,
        y: step * currentCellHeight + 5
      }));
      setDinosaurPositions(currentPositions);

      // 다음 단계로 진행
      setTimeout(() => animateStep(step + 1), 800);
    };

    // 초기 위치 설정 후 애니메이션 시작
    setTimeout(() => animateStep(0), 300);
  }, [gameState, cellWidth, cellHeight]);

  const resetGame = useCallback(() => {
    setGameState({
      players: [],
      ladderHeight: gameState.ladderHeight,
      ladderRungs: [],
      gameStarted: false,
      gameFinished: false,
      results: []
    });
    setIsAnimating(false);
    setDinosaurPositions([]);
    setClimbingPaths([]);
    setCurrentStep(0);
    setCelebrationParticles([]);
    setShowStartEffect(false);
  }, [gameState.ladderHeight]);

  useEffect(() => {
    if (playerCount > 0) {
      initializePlayers();
    }
  }, []);

  return (
    <div className="dinosaur-ladder-game">
      <div className="game-header">
        <h1>🦖 공룡 술게임 사다리타기 🍻</h1>

        <div className="controls">
          <div className="input-group">
            <label>플레이어 수:</label>
            <select
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              disabled={gameState.gameStarted}
            >
              {[2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}명</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>사다리 높이:</label>
            <select
              value={gameState.ladderHeight}
              onChange={(e) => setGameState({
                ...gameState,
                ladderHeight: Number(e.target.value)
              })}
              disabled={gameState.gameStarted}
            >
              {[8, 10, 12, 15].map(num => (
                <option key={num} value={num}>{num}단</option>
              ))}
            </select>
          </div>

          <button onClick={() => setShowNameInput(!showNameInput)} disabled={gameState.gameStarted}>
            이름 입력
          </button>

          <button onClick={initializePlayers} disabled={gameState.gameStarted}>
            새 사다리 생성
          </button>

          <button
            onClick={startGame}
            disabled={gameState.gameStarted || gameState.players.length === 0}
          >
            🍻 시작!
          </button>

          <button onClick={resetGame}>
            다시하기
          </button>
        </div>

        {/* 이름 입력 섹션 */}
        {showNameInput && (
          <div className="name-input-section fade-in">
            <h3>플레이어 이름 입력</h3>
            {Array.from({ length: playerCount }, (_, i) => (
              <input
                key={i}
                type="text"
                placeholder={`${dinosaurTypes[i % dinosaurTypes.length]} 이름`}
                value={playerNames[i] || ''}
                onChange={(e) => {
                  const newNames = [...playerNames];
                  newNames[i] = e.target.value;
                  setPlayerNames(newNames);
                }}
                className="name-input"
              />
            ))}
          </div>
        )}
      </div>

      <div className="game-area">
        {gameState.players.length > 0 && (
          <div
            className="ladder-container"
            style={{
              position: 'relative',
              width: playerCount * cellWidth,
              height: gameState.ladderHeight * cellHeight,
              margin: '10px auto',
              border: '2px solid #8B4513',
              borderRadius: '10px',
              background: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)',
              maxWidth: '95vw',
              overflow: 'hidden'
            }}
          >
            <LadderCanvas
              playerCount={playerCount}
              height={gameState.ladderHeight}
              rungs={gameState.ladderRungs}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
              pathsToShow={climbingPaths}
              currentStep={currentStep}
            />

            {gameState.players.map((player, i) => (
              <Dinosaur
                key={player.id}
                player={player}
                position={dinosaurPositions[i] || { x: 0, y: 0 }}
                isAnimating={isAnimating}
                isClimbing={isAnimating && currentStep > 0}
              />
            ))}
          </div>
        )}

        {gameState.gameFinished && (
          <div className="results fade-in">
            <h2>🍻 술게임 결과 🎉</h2>
            <div className="result-list">
              {gameState.players.map((player, i) => {
                const punishment = drinkingPunishments[gameState.results[i] % drinkingPunishments.length];
                return (
                  <div key={player.id} className="result-item">
                    <span className="dinosaur-icon">
                      {player.dinosaur === 'T-Rex' && '🦖'}
                      {player.dinosaur === 'Triceratops' && '🦕'}
                      {player.dinosaur === 'Stegosaurus' && '🦴'}
                      {player.dinosaur === 'Velociraptor' && '🐉'}
                      {player.dinosaur === 'Brontosaurus' && '🐲'}
                    </span>
                    <div className="result-info">
                      <div className="player-name">{player.name}</div>
                      <div className="punishment">{punishment}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 게임 시작 효과 */}
        {showStartEffect && (
          <div className="game-start-effect fade-in">
            🦖 공룡들이 술을 마시러 간다! 🍻
          </div>
        )}

        {/* 승리 파티클 효과 */}
        {celebrationParticles.map(particle => (
          <div
            key={particle.id}
            className="celebration-particle"
            style={{
              left: particle.x,
              top: particle.y,
              position: 'fixed',
              zIndex: 1000
            }}
          >
            {particle.emoji}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DinosaurLadderGame;