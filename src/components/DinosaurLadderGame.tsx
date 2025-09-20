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
  const [dinosaurReactions, setDinosaurReactions] = useState<{[key: number]: string}>({});
  const [showDinosaurProfiles, setShowDinosaurProfiles] = useState(false);
  const [specialEvent, setSpecialEvent] = useState<string | null>(null);

  // 소리 효과와 진동
  const playSound = (type: 'start' | 'step' | 'finish') => {
    // 웹 오디오 API를 사용한 간단한 비프음
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'start') {
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
    } else if (type === 'step') {
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
    } else if (type === 'finish') {
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.3);
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };
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

  const crazyPunishments = [
    {
      title: '🍺 공룡 울음소리 원샷!',
      description: '자신의 공룡 울음소리를 내며 맥주 1잔!',
      difficulty: 'easy',
      emoji: '🦖'
    },
    {
      title: '🥃 공룡 걸음걸이 챌린지!',
      description: '자신의 공룡처럼 걸어서 술 가져오기!',
      difficulty: 'medium',
      emoji: '🚶‍♂️'
    },
    {
      title: '🍷 공룡 랩배틀!',
      description: '즉석에서 공룡 테마 랩 만들어 부르기!',
      difficulty: 'hard',
      emoji: '🎤'
    },
    {
      title: '🥂 공룡 댄스파티!',
      description: '30초간 공룡 춤추며 건배!',
      difficulty: 'medium',
      emoji: '💃'
    },
    {
      title: '🎉 공룡 로또!',
      description: '면제! 하지만 다른 사람 지목해서 대신 마시게 하기!',
      difficulty: 'easy',
      emoji: '🎰'
    },
    {
      title: '🎪 공룡 모노마네!',
      description: '다른 공룡 3마리 모노마네 성공할 때까지!',
      difficulty: 'hard',
      emoji: '🎭'
    },
    {
      title: '💘 공룡 러브샷!',
      description: '가장 마음에 드는 사람과 러브샷 + 애교멘트!',
      difficulty: 'medium',
      emoji: '💕'
    },
    {
      title: '🌋 공룡시대 스토리텔링!',
      description: '1분간 즉석 공룡 모험담 들려주기!',
      difficulty: 'hard',
      emoji: '📚'
    }
  ];

  const specialEvents = [
    {
      name: '🌋 화산 폭발!',
      description: '모든 공룡이 한 번에 마셔야 해!',
      effect: '전체 원샷',
      probability: 0.1
    },
    {
      name: '☄️ 운석 충돌!',
      description: '가장 뒤에 있는 공룡만 살아남아 면제!',
      effect: '역전 면제',
      probability: 0.15
    },
    {
      name: '🌙 월식의 밤!',
      description: '모든 벌칙이 2배로!',
      effect: '벌칙 강화',
      probability: 0.1
    },
    {
      name: '🌈 공룡 우정!',
      description: '모든 공룡이 함께 러브샷!',
      effect: '단체 러브샷',
      probability: 0.2
    }
  ];

  const dinosaurProfiles = [
    {
      name: 'T-Rex',
      emoji: '🦖',
      personality: '자신만만한 폭군',
      drinkStyle: '한 번에 원샷!',
      reaction: ['으르렁!', '내가 이긴다!', '크아아악!'],
      drunk: '🥴',
      celebration: '👑'
    },
    {
      name: 'Triceratops',
      emoji: '🦕',
      personality: '온순한 방패용사',
      drinkStyle: '천천히 음미하며',
      reaction: ['모에모에!', '조심조심~', '푸훗~'],
      drunk: '😵',
      celebration: '🛡️'
    },
    {
      name: 'Stegosaurus',
      emoji: '🦴',
      personality: '느긋한 철학자',
      drinkStyle: '철학적 사색과 함께',
      reaction: ['음... 흥미롭군', '예상대로야', '그럴 줄 알았어'],
      drunk: '🤯',
      celebration: '🧠'
    },
    {
      name: 'Velociraptor',
      emoji: '🐉',
      personality: '재빠른 사냥꾼',
      drinkStyle: '번개같이 빠르게!',
      reaction: ['쏜살같이!', '먼저 간다!', '따라잡아봐!'],
      drunk: '💫',
      celebration: '⚡'
    },
    {
      name: 'Brontosaurus',
      emoji: '🐲',
      personality: '든든한 거인',
      drinkStyle: '우아하게 대량으로',
      reaction: ['으음...', '천천히 하자', '걱정 마라'],
      drunk: '😴',
      celebration: '🏔️'
    }
  ];

  const colors = ['0deg', '60deg', '120deg', '180deg', '240deg'];

  const initializePlayers = useCallback(() => {
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => {
      const profile = dinosaurProfiles[i % dinosaurProfiles.length];
      return {
        id: i,
        name: playerNames[i] || profile.name,
        dinosaur: profile.name,
        color: colors[i % colors.length]
      };
    });

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
    playSound('start');
    vibrate([200, 100, 200]);
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

        // 특별 이벤트 체크
        const eventRandom = Math.random();
        let triggeredEvent = null;
        for (const event of specialEvents) {
          if (eventRandom < event.probability) {
            triggeredEvent = event;
            setSpecialEvent(event.name + ': ' + event.description);
            break;
          }
        }

        // 게임 완료 효과
        playSound('finish');
        vibrate([300, 200, 300, 200, 300]);

        // 특별 이벤트 제거
        if (triggeredEvent) {
          setTimeout(() => setSpecialEvent(null), 5000);
        }

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

      // 공룡 반응 추가
      const reactions: {[key: number]: string} = {};
      gameState.players.forEach((_, i) => {
        const profile = dinosaurProfiles[i % dinosaurProfiles.length];
        const randomReaction = profile.reaction[Math.floor(Math.random() * profile.reaction.length)];
        reactions[i] = randomReaction;
      });
      setDinosaurReactions(reactions);

      // 단계별 사운드
      playSound('step');
      vibrate(50);

      // 반응 제거 및 다음 단계로 진행
      setTimeout(() => {
        setDinosaurReactions({});
        animateStep(step + 1);
      }, 800);
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

          <button onClick={() => setShowDinosaurProfiles(!showDinosaurProfiles)}>
            🦖 공룡도감
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

          <button onClick={() => {
            const gameData = {
              players: gameState.players.map(p => p.name),
              results: gameState.results,
              punishments: gameState.results.map(r => crazyPunishments[r % crazyPunishments.length].title)
            };
            navigator.clipboard.writeText(
              `🦖 공룡 술게임 결과 🍻\n` +
              gameData.players.map((name, i) =>
                `${name}: ${gameData.punishments[i]}`
              ).join('\n') +
              `\n\n게임 링크: ${window.location.href}`
            );
            alert('결과가 클립보드에 복사되었습니다! 📋');
          }} disabled={!gameState.gameFinished}>
            📱 결과 공유
          </button>
        </div>

        {/* 이름 입력 섹션 */}
        {showNameInput && (
          <div className="name-input-section fade-in">
            <h3>플레이어 이름 입력</h3>
            {Array.from({ length: playerCount }, (_, i) => {
              const profile = dinosaurProfiles[i % dinosaurProfiles.length];
              return (
                <input
                  key={i}
                  type="text"
                  placeholder={`${profile.name} 이름`}
                  value={playerNames[i] || ''}
                  onChange={(e) => {
                    const newNames = [...playerNames];
                    newNames[i] = e.target.value;
                    setPlayerNames(newNames);
                  }}
                  className="name-input"
                />
              );
            })}
          </div>
        )}

        {/* 공룡 도감 섹션 */}
        {showDinosaurProfiles && (
          <div className="dinosaur-profiles fade-in">
            <h3>🦖 공룡 도감</h3>
            <div className="profiles-grid">
              {dinosaurProfiles.map((profile, i) => (
                <div key={i} className="profile-card">
                  <div className="profile-header">
                    <span className="profile-emoji">{profile.emoji}</span>
                    <span className="profile-name">{profile.name}</span>
                  </div>
                  <div className="profile-personality">{profile.personality}</div>
                  <div className="profile-drink">음주스타일: {profile.drinkStyle}</div>
                  <div className="profile-reactions">
                    대사: {profile.reaction.join(', ')}
                  </div>
                </div>
              ))}
            </div>
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
                reaction={dinosaurReactions[i]}
              />
            ))}
          </div>
        )}

        {gameState.gameFinished && (
          <div className="results fade-in">
            <h2>🍻 술게임 결과 🎉</h2>
            <div className="result-list">
              {gameState.players.map((player, i) => {
                const punishment = crazyPunishments[gameState.results[i] % crazyPunishments.length];
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
                      <div className="punishment-title">{punishment.title}</div>
                      <div className="punishment-desc">{punishment.description}</div>
                      <div className="punishment-difficulty">난이도: {punishment.difficulty}</div>
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

        {/* 특별 이벤트 */}
        {specialEvent && (
          <div className="special-event fade-in">
            {specialEvent}
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