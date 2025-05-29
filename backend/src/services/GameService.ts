import { v4 as uuidv4 } from 'uuid';
import { GameState, GameStatus, Move, PlayerSymbol, GameResult } from '../types/game.types';
import { Player, BotPlayer, BotDifficulty } from '../types/player.types';
import { 
  createEmptyBoard, 
  makeMove, 
  isValidMove, 
  checkWinner, 
  isGameFinished,
  getOpponentSymbol 
} from '../utils/gameLogic';

export class GameService {
  private games: Map<string, GameState> = new Map();

  /**
   * Cria novo jogo entre dois jogadores humanos
   */
  createHumanVsHumanGame(player1Id: string, player2Id: string): GameState {
    const gameId = uuidv4();
    
    const player1: Player = {
      id: player1Id,
      name: `Jogador ${player1Id.slice(-4)}`,
      isBot: false,
      socketId: player1Id,
      connected: true,
      joinedAt: new Date()
    };

    const player2: Player = {
      id: player2Id,
      name: `Jogador ${player2Id.slice(-4)}`,
      isBot: false,
      socketId: player2Id,
      connected: true,
      joinedAt: new Date()
    };

    // Randomizar quem joga primeiro
    const isPlayer1First = Math.random() < 0.5;
    
    const gameState: GameState = {
      id: gameId,
      board: createEmptyBoard(),
      currentPlayer: 'X',
      status: GameStatus.PLAYING,
      winner: null,
      players: {
        X: isPlayer1First ? player1 : player2,
        O: isPlayer1First ? player2 : player1
      },
      moves: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.games.set(gameId, gameState);
    return gameState;
  }

  /**
   * Cria novo jogo contra bot
   */
  createHumanVsBotGame(playerId: string, botDifficulty: BotDifficulty = BotDifficulty.MEDIUM): GameState {
    const gameId = uuidv4();
    
    const humanPlayer: Player = {
      id: playerId,
      name: `Jogador ${playerId.slice(-4)}`,
      isBot: false,
      socketId: playerId,
      connected: true,
      joinedAt: new Date()
    };

    const botPlayer: BotPlayer = {
      id: `bot-${uuidv4()}`,
      name: this.generateBotName(),
      isBot: true,
      difficulty: botDifficulty,
      connected: true,
      joinedAt: new Date()
    };

    // Humano sempre joga primeiro contra bot
    const gameState: GameState = {
      id: gameId,
      board: createEmptyBoard(),
      currentPlayer: 'X',
      status: GameStatus.PLAYING,
      winner: null,
      players: {
        X: humanPlayer,
        O: botPlayer
      },
      moves: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.games.set(gameId, gameState);
    return gameState;
  }

  /**
   * Processa uma jogada
   */
  makeMove(gameId: string, row: number, col: number, playerId: string): { 
    success: boolean; 
    gameState?: GameState; 
    error?: string;
    isGameFinished?: boolean;
    gameResult?: GameResult;
  } {
    const game = this.games.get(gameId);
    
    if (!game) {
      return { success: false, error: 'Jogo não encontrado' };
    }

    if (game.status !== GameStatus.PLAYING) {
      return { success: false, error: 'Jogo não está activo' };
    }

    // Verificar se é a vez do jogador
    const currentPlayerData = game.players[game.currentPlayer];
    if (currentPlayerData.id !== playerId) {
      return { success: false, error: 'Não é a sua vez' };
    }

    // Verificar se a jogada é válida
    if (!isValidMove(game.board, row, col)) {
      return { success: false, error: 'Jogada inválida' };
    }

    try {
      // Fazer a jogada
      const newBoard = makeMove(game.board, row, col, game.currentPlayer);
      
      // Criar movimento
      const move: Move = {
        row,
        col,
        player: game.currentPlayer,
        timestamp: new Date()
      };

      // Atualizar estado do jogo
      game.board = newBoard;
      game.moves.push(move);
      game.updatedAt = new Date();

      // Verificar se jogo terminou
      const gameResult = checkWinner(newBoard);
      const finished = isGameFinished(newBoard);

      if (finished) {
        game.status = GameStatus.FINISHED;
        game.winner = gameResult.winner;
      } else {
        // Alternar jogador
        game.currentPlayer = getOpponentSymbol(game.currentPlayer);
      }

      this.games.set(gameId, game);

      return { 
        success: true, 
        gameState: game,
        isGameFinished: finished,
        gameResult: finished ? gameResult : undefined
      };

    } catch (error) {
      return { success: false, error: 'Erro ao processar jogada' };
    }
  }

  /**
   * Obter estado do jogo
   */
  getGame(gameId: string): GameState | null {
    return this.games.get(gameId) || null;
  }

  /**
   * Verificar se é a vez do bot
   */
  isBotTurn(gameId: string): boolean {
    const game = this.games.get(gameId);
    if (!game) return false;
    
    const currentPlayer = game.players[game.currentPlayer];
    return currentPlayer.isBot;
  }

  /**
   * Obter jogador bot do jogo
   */
  getBotPlayer(gameId: string): BotPlayer | null {
    const game = this.games.get(gameId);
    if (!game) return null;

    const playerX = game.players.X;
    const playerO = game.players.O;

    if (playerX.isBot) return playerX as BotPlayer;
    if (playerO.isBot) return playerO as BotPlayer;
    
    return null;
  }

  /**
   * Marcar jogador como desconectado
   */
  markPlayerDisconnected(playerId: string): string[] {
    const affectedGames: string[] = [];
    
    this.games.forEach((game, gameId) => {
      const playerX = game.players.X;
      const playerO = game.players.O;
      
      if (playerX.id === playerId) {
        playerX.connected = false;
        affectedGames.push(gameId);
      } else if (playerO.id === playerId) {
        playerO.connected = false;
        affectedGames.push(gameId);
      }
    });

    return affectedGames;
  }

  /**
   * Marcar jogador como reconectado
   */
  markPlayerReconnected(playerId: string, socketId: string): string[] {
    const affectedGames: string[] = [];
    
    this.games.forEach((game, gameId) => {
      const playerX = game.players.X;
      const playerO = game.players.O;
      
      if (playerX.id === playerId) {
        playerX.connected = true;
        playerX.socketId = socketId;
        affectedGames.push(gameId);
      } else if (playerO.id === playerId) {
        playerO.connected = true;
        playerO.socketId = socketId;
        affectedGames.push(gameId);
      }
    });

    return affectedGames;
  }

  /**
   * Abandonar jogo
   */
  abandonGame(gameId: string, playerId: string): GameState | null {
    const game = this.games.get(gameId);
    if (!game) return null;

    game.status = GameStatus.ABANDONED;
    
    // O outro jogador ganha por abandono
    const playerX = game.players.X;
    const playerO = game.players.O;
    
    if (playerX.id === playerId) {
      game.winner = 'O';
    } else if (playerO.id === playerId) {
      game.winner = 'X';
    }

    game.updatedAt = new Date();
    this.games.set(gameId, game);
    
    return game;
  }

  /**
   * Obter estatísticas
   */
  getStats() {
    const totalGames = this.games.size;
    const activeGames = Array.from(this.games.values()).filter(g => g.status === GameStatus.PLAYING).length;
    const finishedGames = Array.from(this.games.values()).filter(g => g.status === GameStatus.FINISHED).length;
    
    return {
      totalGames,
      activeGames,
      finishedGames,
      gamesInMemory: this.games.size
    };
  }

  /**
   * Cleanup - remove jogos antigos
   */
  cleanup(maxAgeMs: number = 24 * 60 * 60 * 1000): void { // 24 horas por defeito
    const now = Date.now();
    
    this.games.forEach((game, gameId) => {
      const gameAge = now - game.updatedAt.getTime();
      if (gameAge > maxAgeMs && game.status !== GameStatus.PLAYING) {
        this.games.delete(gameId);
      }
    });
  }

  /**
   * Gerar nome aleatório para bot
   */
  private generateBotName(): string {
    const names = [
      'Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta', 
      'Calculador', 'Estrategista', 'Magnus Bot', 'Deep Think',
      'AI-nstein', 'Robo Galo', 'ByteBot', 'Logic Master'
    ];
    
    return names[Math.floor(Math.random() * names.length)];
  }
} 