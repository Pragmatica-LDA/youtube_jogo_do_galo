import { GameBoard, PlayerSymbol, GameResult } from '../types/game.types';
/**
 * Cria um tabuleiro vazio 3x3
 */
export declare function createEmptyBoard(): GameBoard;
/**
 * Verifica se uma jogada é válida
 */
export declare function isValidMove(board: GameBoard, row: number, col: number): boolean;
/**
 * Faz uma jogada no tabuleiro
 */
export declare function makeMove(board: GameBoard, row: number, col: number, player: PlayerSymbol): GameBoard;
/**
 * Verifica se há um vencedor no tabuleiro
 */
export declare function checkWinner(board: GameBoard): GameResult;
/**
 * Obtém todas as jogadas possíveis
 */
export declare function getAvailableMoves(board: GameBoard): Array<{
    row: number;
    col: number;
}>;
/**
 * Alterna o jogador atual
 */
export declare function getOpponentSymbol(player: PlayerSymbol): PlayerSymbol;
/**
 * Verifica se o jogo terminou
 */
export declare function isGameFinished(board: GameBoard): boolean;
//# sourceMappingURL=gameLogic.d.ts.map