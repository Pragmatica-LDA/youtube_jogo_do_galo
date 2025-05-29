import { GameState, GameResult } from '../types/game.types';
import { BotPlayer, BotDifficulty } from '../types/player.types';
export declare class GameService {
    private games;
    /**
     * Cria novo jogo entre dois jogadores humanos
     */
    createHumanVsHumanGame(player1Id: string, player2Id: string): GameState;
    /**
     * Cria novo jogo contra bot
     */
    createHumanVsBotGame(playerId: string, botDifficulty?: BotDifficulty): GameState;
    /**
     * Processa uma jogada
     */
    makeMove(gameId: string, row: number, col: number, playerId: string): {
        success: boolean;
        gameState?: GameState;
        error?: string;
        isGameFinished?: boolean;
        gameResult?: GameResult;
    };
    /**
     * Obter estado do jogo
     */
    getGame(gameId: string): GameState | null;
    /**
     * Verificar se é a vez do bot
     */
    isBotTurn(gameId: string): boolean;
    /**
     * Obter jogador bot do jogo
     */
    getBotPlayer(gameId: string): BotPlayer | null;
    /**
     * Marcar jogador como desconectado
     */
    markPlayerDisconnected(playerId: string): string[];
    /**
     * Marcar jogador como reconectado
     */
    markPlayerReconnected(playerId: string, socketId: string): string[];
    /**
     * Abandonar jogo
     */
    abandonGame(gameId: string, playerId: string): GameState | null;
    /**
     * Obter estatísticas
     */
    getStats(): {
        totalGames: number;
        activeGames: number;
        finishedGames: number;
        gamesInMemory: number;
    };
    /**
     * Cleanup - remove jogos antigos
     */
    cleanup(maxAgeMs?: number): void;
    /**
     * Gerar nome aleatório para bot
     */
    private generateBotName;
}
//# sourceMappingURL=GameService.d.ts.map