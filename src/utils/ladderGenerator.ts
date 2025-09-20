import type { LadderRung } from '../types/Game';

export const generateLadder = (playerCount: number, height: number): LadderRung[] => {
  const rungs: LadderRung[] = [];

  for (let level = 1; level < height; level++) {
    const availablePositions: number[] = [];

    // 이전 레벨의 연결된 위치들을 확인
    const previousLevelRungs = rungs.filter(rung => rung.level === level - 1);
    const connectedPositions = new Set<number>();

    previousLevelRungs.forEach(rung => {
      connectedPositions.add(rung.left);
      connectedPositions.add(rung.right);
    });

    // 연속적으로 연결되지 않은 위치만 선택 가능
    for (let i = 0; i < playerCount - 1; i++) {
      if (!connectedPositions.has(i) && !connectedPositions.has(i + 1)) {
        availablePositions.push(i);
      }
    }

    // 랜덤하게 일부 위치 선택 (너무 많지 않게)
    if (availablePositions.length > 0) {
      const maxRungs = Math.min(availablePositions.length, Math.max(1, Math.floor(availablePositions.length / 2)));
      const shuffled = availablePositions.sort(() => Math.random() - 0.5);
      const selectedPositions = shuffled.slice(0, Math.floor(Math.random() * maxRungs) + 1);

      // 선택된 위치들이 인접하지 않도록 필터링
      const finalPositions: number[] = [];
      selectedPositions.sort((a, b) => a - b).forEach(pos => {
        if (finalPositions.length === 0 || pos > finalPositions[finalPositions.length - 1] + 1) {
          finalPositions.push(pos);
        }
      });

      finalPositions.forEach(pos => {
        rungs.push({
          left: pos,
          right: pos + 1,
          level
        });
      });
    }
  }

  return rungs;
};

export const tracePath = (startPosition: number, rungs: LadderRung[], height: number): number => {
  let currentPosition = startPosition;

  for (let level = 1; level < height; level++) {
    const rungAtLevel = rungs.find(rung =>
      rung.level === level &&
      (rung.left === currentPosition || rung.right === currentPosition)
    );

    if (rungAtLevel) {
      currentPosition = rungAtLevel.left === currentPosition
        ? rungAtLevel.right
        : rungAtLevel.left;
    }
  }

  return currentPosition;
};

export const getDetailedPath = (startPosition: number, rungs: LadderRung[], height: number): number[] => {
  const path = [startPosition];
  let currentPosition = startPosition;

  for (let level = 1; level < height; level++) {
    const rungAtLevel = rungs.find(rung =>
      rung.level === level &&
      (rung.left === currentPosition || rung.right === currentPosition)
    );

    if (rungAtLevel) {
      currentPosition = rungAtLevel.left === currentPosition
        ? rungAtLevel.right
        : rungAtLevel.left;
    }
    path.push(currentPosition);
  }

  return path;
};

// 사다리가 올바른지 검증 (모든 플레이어가 다른 위치에 도착하는지)
export const validateLadder = (playerCount: number, rungs: LadderRung[], height: number): boolean => {
  const finalPositions = new Set<number>();

  for (let i = 0; i < playerCount; i++) {
    const finalPos = tracePath(i, rungs, height);
    if (finalPositions.has(finalPos)) {
      return false; // 같은 위치에 도착하는 플레이어가 있음
    }
    finalPositions.add(finalPos);
  }

  return finalPositions.size === playerCount;
};

// 올바른 사다리가 생성될 때까지 재시도
export const generateValidLadder = (playerCount: number, height: number): LadderRung[] => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const ladder = generateLadder(playerCount, height);
    if (validateLadder(playerCount, ladder, height)) {
      return ladder;
    }
    attempts++;
  }

  // 최대 시도 횟수 도달 시 간단한 사다리 생성
  return generateSimpleLadder(playerCount, height);
};

// 간단하지만 올바른 사다리 생성 (백업용)
const generateSimpleLadder = (playerCount: number, height: number): LadderRung[] => {
  const rungs: LadderRung[] = [];

  for (let level = 1; level < height; level++) {
    // 50% 확률로 하나의 랜덤 연결만 생성
    if (Math.random() < 0.5) {
      const pos = Math.floor(Math.random() * (playerCount - 1));
      rungs.push({
        left: pos,
        right: pos + 1,
        level
      });
    }
  }

  return rungs;
};