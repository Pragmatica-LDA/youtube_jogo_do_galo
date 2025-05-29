import { GameState, Move, PlayerSymbol } from './game.types';
import { Player, BotDifficulty } from './player.types';
export interface ClientToServerEvents {
    'join-queue': (data?: {
        botDifficulty?: BotDifficulty;
    }) => void;
    'leave-queue': () => void;
    'make-move': (data: {
        gameId: string;
        row: number;
        col: number;
    }) => void;
    'leave-game': (gameId: string) => void;
    'reconnect-game': (gameId: string) => void;
}
export interface ServerToClientEvents {
    'queue-status': (data: {
        position: number;
        countdown: number;
    }) => void;
    'match-found': (data: {
        gameId: string;
        opponent: Player;
        yourSymbol: PlayerSymbol;
    }) => void;
    'game-start': (gameState: GameState) => void;
    'move-made': (data: {
        move: Move;
        gameState: GameState;
    }) => void;
    'game-end': (data: {
        result: 'win' | 'lose' | 'draw';
        gameState: GameState;
    }) => void;
    'error': (data: {
        message: string;
        code?: string;
    }) => void;
    'opponent-disconnected': () => void;
    'opponent-reconnected': () => void;
    'queue-left': () => void;
}
export interface InterServerEvents {
    'game-update': (gameId: string, gameState: GameState) => void;
}
export interface SocketData {
    playerId: string;
    currentGameId?: string;
    inQueue: boolean;
    preferredBotDifficulty?: BotDifficulty;
}
//# sourceMappingURL=socket.types.d.ts.map