import { GameBoard, CellValue, PlayerSymbol, GameResult, WinningLine } from '../types/game.types';

/**
 * Cria um tabuleiro vazio 3x3
 */
export function createEmptyBoard(): GameBoard {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ];
}

/**
 * Verifica se uma jogada é válida
 */
export function isValidMove(board: GameBoard, row: number, col: number): boolean {
  // Verificar se as coordenadas estão dentro dos limites
  if (row < 0 || row > 2 || col < 0 || col > 2) {
    return false;
  }
  
  // Verificar se a célula está vazia
  return board[row][col] === null;
}

/**
 * Faz uma jogada no tabuleiro
 */
export function makeMove(board: GameBoard, row: number, col: number, player: PlayerSymbol): GameBoard {
  if (!isValidMove(board, row, col)) {
    throw new Error('Jogada inválida');
  }
  
  // Criar uma cópia do tabuleiro
  const newBoard = board.map(row => [...row]);
  newBoard[row][col] = player;
  
  return newBoard;
}

/**
 * Verifica se há um vencedor no tabuleiro
 */
export function checkWinner(board: GameBoard): GameResult {
  // Verificar linhas
  for (let row = 0; row < 3; row++) {
    if (board[row][0] && board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
      return {
        winner: board[row][0],
        winningLine: {
          type: 'row',
          index: row,
          positions: [
            { row, col: 0 },
            { row, col: 1 },
            { row, col: 2 }
          ]
        },
        isDraw: false
      };
    }
  }
  
  // Verificar colunas
  for (let col = 0; col < 3; col++) {
    if (board[0][col] && board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
      return {
        winner: board[0][col],
        winningLine: {
          type: 'col',
          index: col,
          positions: [
            { row: 0, col },
            { row: 1, col },
            { row: 2, col }
          ]
        },
        isDraw: false
      };
    }
  }
  
  // Verificar diagonal principal (top-left to bottom-right)
  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    return {
      winner: board[0][0],
      winningLine: {
        type: 'diagonal',
        index: 0,
        positions: [
          { row: 0, col: 0 },
          { row: 1, col: 1 },
          { row: 2, col: 2 }
        ]
      },
      isDraw: false
    };
  }
  
  // Verificar diagonal secundária (top-right to bottom-left)
  if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    return {
      winner: board[0][2],
      winningLine: {
        type: 'diagonal',
        index: 1,
        positions: [
          { row: 0, col: 2 },
          { row: 1, col: 1 },
          { row: 2, col: 0 }
        ]
      },
      isDraw: false
    };
  }
  
  // Verificar se o tabuleiro está cheio (empate)
  const isBoardFull = board.every(row => row.every(cell => cell !== null));
  
  return {
    winner: null,
    isDraw: isBoardFull,
    winningLine: undefined
  };
}

/**
 * Obtém todas as jogadas possíveis
 */
export function getAvailableMoves(board: GameBoard): Array<{ row: number; col: number }> {
  const moves: Array<{ row: number; col: number }> = [];
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === null) {
        moves.push({ row, col });
      }
    }
  }
  
  return moves;
}

/**
 * Alterna o jogador atual
 */
export function getOpponentSymbol(player: PlayerSymbol): PlayerSymbol {
  return player === 'X' ? 'O' : 'X';
}

/**
 * Verifica se o jogo terminou
 */
export function isGameFinished(board: GameBoard): boolean {
  const result = checkWinner(board);
  return result.winner !== null || result.isDraw;
} 