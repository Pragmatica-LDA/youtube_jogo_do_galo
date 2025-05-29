export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  socketId?: string;
  connected: boolean;
  joinedAt: Date;
}

export interface BotPlayer extends Player {
  isBot: true;
  difficulty: BotDifficulty;
}

export enum BotDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface MatchmakingPlayer {
  playerId: string;
  socketId: string;
  joinedQueueAt: Date;
} 