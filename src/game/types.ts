export type CellValue = 'X' | 'O' | null;

export interface Move {
  x: number;
  y: number;
  symbol: 'X' | 'O';
  timestamp: number;
}

export interface Room {
  code: string;
  boardSize: number;
  board: CellValue[][];
  players: Map<string, 'X' | 'O'>;
  currentTurn: 'X' | 'O';
  moves: Move[];
  winner: 'X' | 'O' | 'draw' | null;
  winLine: { x: number; y: number }[] | null;
  createdAt: Date;
}

export interface GameRecord {
  id?: number;
  roomCode: string;
  boardSize: number;
  winner: 'X' | 'O' | 'draw' | null;
  moves: Move[];
  createdAt: Date;
  finishedAt: Date | null;
}
