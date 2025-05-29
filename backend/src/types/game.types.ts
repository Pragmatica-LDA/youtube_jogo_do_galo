import { Player } from './player.types';

export type PlayerSymbol = 'X' | 'O';
export type CellValue = PlayerSymbol | null;
export type GameBoard = CellValue[][];

export interface GameState {
  id: string;
  board: GameBoard;
  currentPlayer: PlayerSymbol;
  status: GameStatus;
  winner: PlayerSymbol | null;
  players: {
    X: Player;
    O: Player;
  };
  moves: Move[];
  createdAt: Date;
  updatedAt: Date;
}

export enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
  ABANDONED = 'abandoned'
}

export interface Move {
  row: number;
  col: number;
  player: PlayerSymbol;
  timestamp: Date;
}

export interface GameResult {
  winner: PlayerSymbol | null;
  winningLine?: WinningLine;
  isDraw: boolean;
}

export interface WinningLine {
  type: 'row' | 'col' | 'diagonal';
  index: number;
  positions: Array<{ row: number; col: number }>;
} 