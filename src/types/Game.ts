export interface Player {
  id: number;
  name: string;
  dinosaur: string;
  color: string;
}

export interface LadderRung {
  left: number;
  right: number;
  level: number;
}

export interface GameState {
  players: Player[];
  ladderHeight: number;
  ladderRungs: LadderRung[];
  gameStarted: boolean;
  gameFinished: boolean;
  results: number[];
}

export interface Position {
  x: number;
  y: number;
}