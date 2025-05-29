import type { Player, PlayerSymbol } from './game.types';

export const BotDifficulty = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
} as const;

export type BotDifficulty = typeof BotDifficulty[keyof typeof BotDifficulty];

export interface MatchmakingState {
  inQueue: boolean;
  position: number;
  countdown: number;
  opponentFound: boolean;
  gameId: string | null;
}

export interface QueueStatus {
  position: number;
  countdown: number;
}

export interface MatchFound {
  gameId: string;
  opponent: Player;
  yourSymbol: PlayerSymbol;
}

export interface GameEndResult {
  result: 'win' | 'lose' | 'draw';
  gameState: any; // GameState from backend
} 