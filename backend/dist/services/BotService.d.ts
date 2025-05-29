import { GameBoard, PlayerSymbol } from '../types/game.types';
import { BotDifficulty } from '../types/player.types';
interface BotMove {
    row: number;
    col: number;
    score?: number;
}
export declare class BotService {
    /**
     * Calcula melhor jogada para o bot
     */
    getBotMove(board: GameBoard, botSymbol: PlayerSymbol, difficulty: BotDifficulty): BotMove;
    /**
     * Nível fácil - 70% aleatório, 30% optimal
     */
    private getEasyMove;
    /**
     * Nível médio - minimax com profundidade limitada
     */
    private getMediumMove;
    /**
     * Nível difícil - minimax completo (invencível)
     */
    private getHardMove;
    /**
     * Obtém jogada optimal usando minimax completo
     */
    private getOptimalMove;
    /**
     * Algoritmo Minimax
     */
    private minimax;
    /**
     * Adiciona delay realista ao bot
     */
    getBotMoveWithDelay(board: GameBoard, botSymbol: PlayerSymbol, difficulty: BotDifficulty): Promise<BotMove>;
    /**
     * Calcula delay base por dificuldade
     */
    private getBaseDelay;
    /**
     * Avalia se posição é estratégica (cantos e centro)
     */
    private isStrategicPosition;
    /**
     * Obtém jogadas prioritárias (para medium difficulty)
     */
    private getPriorityMoves;
}
export {};
//# sourceMappingURL=BotService.d.ts.map