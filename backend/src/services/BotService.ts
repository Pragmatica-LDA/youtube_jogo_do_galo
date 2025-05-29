import { GameBoard, PlayerSymbol } from '../types/game.types';
import { BotDifficulty } from '../types/player.types';
import { 
  isValidMove, 
  makeMove, 
  checkWinner, 
  getAvailableMoves,
  getOpponentSymbol 
} from '../utils/gameLogic';

interface BotMove {
  row: number;
  col: number;
  score?: number;
}

export class BotService {
  /**
   * Calcula melhor jogada para o bot
   */
  getBotMove(board: GameBoard, botSymbol: PlayerSymbol, difficulty: BotDifficulty): BotMove {
    switch (difficulty) {
      case BotDifficulty.EASY:
        return this.getEasyMove(board);
      
      case BotDifficulty.MEDIUM:
        return this.getMediumMove(board, botSymbol);
      
      case BotDifficulty.HARD:
        return this.getHardMove(board, botSymbol);
      
      default:
        return this.getMediumMove(board, botSymbol);
    }
  }

  /**
   * Nível fácil - 70% aleatório, 30% optimal
   */
  private getEasyMove(board: GameBoard): BotMove {
    const availableMoves = getAvailableMoves(board);
    
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
  private getMediumMove(board: GameBoard, botSymbol: PlayerSymbol): BotMove {
    // Usar minimax com profundidade máxima de 4
    return this.minimax(board, 4, true, botSymbol, botSymbol);
  }

  /**
   * Nível difícil - minimax completo (invencível)
   */
  private getHardMove(board: GameBoard, botSymbol: PlayerSymbol): BotMove {
    return this.getOptimalMove(board, botSymbol);
  }

  /**
   * Obtém jogada optimal usando minimax completo
   */
  private getOptimalMove(board: GameBoard, botSymbol: PlayerSymbol): BotMove {
    // Usar minimax com profundidade máxima (9 para jogo do galo)
    return this.minimax(board, 9, true, botSymbol, botSymbol);
  }

  /**
   * Algoritmo Minimax
   */
  private minimax(
    board: GameBoard, 
    depth: number, 
    isMaximizing: boolean, 
    currentPlayer: PlayerSymbol,
    botSymbol: PlayerSymbol
  ): BotMove {
    const gameResult = checkWinner(board);
    
    // Casos terminais
    if (gameResult.winner === botSymbol) {
      return { row: -1, col: -1, score: 10 + depth };
    }
    
    if (gameResult.winner === getOpponentSymbol(botSymbol)) {
      return { row: -1, col: -1, score: -10 - depth };
    }
    
    if (gameResult.isDraw || depth === 0) {
      return { row: -1, col: -1, score: 0 };
    }

    const availableMoves = getAvailableMoves(board);
    
    if (isMaximizing) {
      let bestMove: BotMove = { row: -1, col: -1, score: -Infinity };
      
      for (const move of availableMoves) {
        const newBoard = makeMove(board, move.row, move.col, currentPlayer);
        const result = this.minimax(
          newBoard, 
          depth - 1, 
          false, 
          getOpponentSymbol(currentPlayer), 
          botSymbol
        );
        
        if (result.score! > bestMove.score!) {
          bestMove = {
            row: move.row,
            col: move.col,
            score: result.score
          };
        }
      }
      
      return bestMove;
    } else {
      let bestMove: BotMove = { row: -1, col: -1, score: Infinity };
      
      for (const move of availableMoves) {
        const newBoard = makeMove(board, move.row, move.col, currentPlayer);
        const result = this.minimax(
          newBoard, 
          depth - 1, 
          true, 
          getOpponentSymbol(currentPlayer), 
          botSymbol
        );
        
        if (result.score! < bestMove.score!) {
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
  async getBotMoveWithDelay(
    board: GameBoard, 
    botSymbol: PlayerSymbol, 
    difficulty: BotDifficulty
  ): Promise<BotMove> {
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
  private getBaseDelay(difficulty: BotDifficulty): number {
    switch (difficulty) {
      case BotDifficulty.EASY:
        return 500; // 0.5 segundos
      
      case BotDifficulty.MEDIUM:
        return 1000; // 1 segundo
      
      case BotDifficulty.HARD:
        return 1500; // 1.5 segundos
      
      default:
        return 1000;
    }
  }

  /**
   * Avalia se posição é estratégica (cantos e centro)
   */
  private isStrategicPosition(row: number, col: number): boolean {
    // Centro é sempre estratégico
    if (row === 1 && col === 1) return true;
    
    // Cantos são estratégicos
    const corners = [
      [0, 0], [0, 2], [2, 0], [2, 2]
    ];
    
    return corners.some(([r, c]) => r === row && c === col);
  }

  /**
   * Obtém jogadas prioritárias (para medium difficulty)
   */
  private getPriorityMoves(board: GameBoard, botSymbol: PlayerSymbol): BotMove[] {
    const availableMoves = getAvailableMoves(board);
    const priorityMoves: BotMove[] = [];

    // 1. Verificar se pode ganhar
    for (const move of availableMoves) {
      const testBoard = makeMove(board, move.row, move.col, botSymbol);
      const result = checkWinner(testBoard);
      if (result.winner === botSymbol) {
        priorityMoves.push({ ...move, score: 100 });
      }
    }

    // 2. Verificar se precisa bloquear adversário
    const opponentSymbol = getOpponentSymbol(botSymbol);
    for (const move of availableMoves) {
      const testBoard = makeMove(board, move.row, move.col, opponentSymbol);
      const result = checkWinner(testBoard);
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