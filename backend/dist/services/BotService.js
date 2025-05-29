"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotService = void 0;
const player_types_1 = require("../types/player.types");
const gameLogic_1 = require("../utils/gameLogic");
class BotService {
    /**
     * Calcula melhor jogada para o bot
     */
    getBotMove(board, botSymbol, difficulty) {
        switch (difficulty) {
            case player_types_1.BotDifficulty.EASY:
                return this.getEasyMove(board);
            case player_types_1.BotDifficulty.MEDIUM:
                return this.getMediumMove(board, botSymbol);
            case player_types_1.BotDifficulty.HARD:
                return this.getHardMove(board, botSymbol);
            default:
                return this.getMediumMove(board, botSymbol);
        }
    }
    /**
     * Nível fácil - 70% aleatório, 30% optimal
     */
    getEasyMove(board) {
        const availableMoves = (0, gameLogic_1.getAvailableMoves)(board);
        if (availableMoves.length === 0) {
            throw new Error('Nenhuma jogada disponível');
        }
        // 30% chance de fazer jogada optimal
        if (Math.random() < 0.3) {
            return this.getOptimalMove(board, 'O');
        }
        // 70% chance de jogada aleatória
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    }
    /**
     * Nível médio - minimax com profundidade limitada
     */
    getMediumMove(board, botSymbol) {
        // Usar minimax com profundidade máxima de 4
        return this.minimax(board, 4, true, botSymbol, botSymbol);
    }
    /**
     * Nível difícil - minimax completo (invencível)
     */
    getHardMove(board, botSymbol) {
        return this.getOptimalMove(board, botSymbol);
    }
    /**
     * Obtém jogada optimal usando minimax completo
     */
    getOptimalMove(board, botSymbol) {
        // Usar minimax com profundidade máxima (9 para jogo do galo)
        return this.minimax(board, 9, true, botSymbol, botSymbol);
    }
    /**
     * Algoritmo Minimax
     */
    minimax(board, depth, isMaximizing, currentPlayer, botSymbol) {
        const gameResult = (0, gameLogic_1.checkWinner)(board);
        // Casos terminais
        if (gameResult.winner === botSymbol) {
            return { row: -1, col: -1, score: 10 + depth };
        }
        if (gameResult.winner === (0, gameLogic_1.getOpponentSymbol)(botSymbol)) {
            return { row: -1, col: -1, score: -10 - depth };
        }
        if (gameResult.isDraw || depth === 0) {
            return { row: -1, col: -1, score: 0 };
        }
        const availableMoves = (0, gameLogic_1.getAvailableMoves)(board);
        if (isMaximizing) {
            let bestMove = { row: -1, col: -1, score: -Infinity };
            for (const move of availableMoves) {
                const newBoard = (0, gameLogic_1.makeMove)(board, move.row, move.col, currentPlayer);
                const result = this.minimax(newBoard, depth - 1, false, (0, gameLogic_1.getOpponentSymbol)(currentPlayer), botSymbol);
                if (result.score > bestMove.score) {
                    bestMove = {
                        row: move.row,
                        col: move.col,
                        score: result.score
                    };
                }
            }
            return bestMove;
        }
        else {
            let bestMove = { row: -1, col: -1, score: Infinity };
            for (const move of availableMoves) {
                const newBoard = (0, gameLogic_1.makeMove)(board, move.row, move.col, currentPlayer);
                const result = this.minimax(newBoard, depth - 1, true, (0, gameLogic_1.getOpponentSymbol)(currentPlayer), botSymbol);
                if (result.score < bestMove.score) {
                    bestMove = {
                        row: move.row,
                        col: move.col,
                        score: result.score
                    };
                }
            }
            return bestMove;
        }
    }
    /**
     * Adiciona delay realista ao bot
     */
    async getBotMoveWithDelay(board, botSymbol, difficulty) {
        // Calcular delay baseado na dificuldade
        const baseDelay = this.getBaseDelay(difficulty);
        const randomDelay = Math.random() * 1000; // 0-1 segundo adicional
        const totalDelay = baseDelay + randomDelay;
        // Simular "pensamento" do bot
        await new Promise(resolve => setTimeout(resolve, totalDelay));
        return this.getBotMove(board, botSymbol, difficulty);
    }
    /**
     * Calcula delay base por dificuldade
     */
    getBaseDelay(difficulty) {
        switch (difficulty) {
            case player_types_1.BotDifficulty.EASY:
                return 500; // 0.5 segundos
            case player_types_1.BotDifficulty.MEDIUM:
                return 1000; // 1 segundo
            case player_types_1.BotDifficulty.HARD:
                return 1500; // 1.5 segundos
            default:
                return 1000;
        }
    }
    /**
     * Avalia se posição é estratégica (cantos e centro)
     */
    isStrategicPosition(row, col) {
        // Centro é sempre estratégico
        if (row === 1 && col === 1)
            return true;
        // Cantos são estratégicos
        const corners = [
            [0, 0], [0, 2], [2, 0], [2, 2]
        ];
        return corners.some(([r, c]) => r === row && c === col);
    }
    /**
     * Obtém jogadas prioritárias (para medium difficulty)
     */
    getPriorityMoves(board, botSymbol) {
        const availableMoves = (0, gameLogic_1.getAvailableMoves)(board);
        const priorityMoves = [];
        // 1. Verificar se pode ganhar
        for (const move of availableMoves) {
            const testBoard = (0, gameLogic_1.makeMove)(board, move.row, move.col, botSymbol);
            const result = (0, gameLogic_1.checkWinner)(testBoard);
            if (result.winner === botSymbol) {
                priorityMoves.push({ ...move, score: 100 });
            }
        }
        // 2. Verificar se precisa bloquear adversário
        const opponentSymbol = (0, gameLogic_1.getOpponentSymbol)(botSymbol);
        for (const move of availableMoves) {
            const testBoard = (0, gameLogic_1.makeMove)(board, move.row, move.col, opponentSymbol);
            const result = (0, gameLogic_1.checkWinner)(testBoard);
            if (result.winner === opponentSymbol) {
                priorityMoves.push({ ...move, score: 50 });
            }
        }
        // 3. Posições estratégicas
        for (const move of availableMoves) {
            if (this.isStrategicPosition(move.row, move.col)) {
                priorityMoves.push({ ...move, score: 10 });
            }
        }
        return priorityMoves.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
}
exports.BotService = BotService;
//# sourceMappingURL=BotService.js.map