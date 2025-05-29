import { io, Socket } from 'socket.io-client';
import type { GameState, Move } from '../types/game.types';
import type { QueueStatus, MatchFound, GameEndResult, BotDifficulty } from '../types/matchmaking.types';

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl: string;

  constructor() {
    this.serverUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  }

  /**
   * Conecta ao servidor WebSocket
   */
  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.setupEventListeners();
    return this.socket;
  }

  /**
   * Desconecta do servidor
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Obtém a instância do socket
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Entrar na fila de matchmaking
   */
  joinQueue(botDifficulty?: BotDifficulty): void {
    if (this.socket?.connected) {
      this.socket.emit('join-queue', { botDifficulty });
    }
  }

  /**
   * Sair da fila de matchmaking
   */
  leaveQueue(): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-queue');
    }
  }

  /**
   * Fazer uma jogada
   */
  makeMove(gameId: string, row: number, col: number): void {
    if (this.socket?.connected) {
      this.socket.emit('make-move', { gameId, row, col });
    }
  }

  /**
   * Abandonar jogo
   */
  leaveGame(gameId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-game', gameId);
    }
  }

  /**
   * Configurar listeners básicos
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Conectado ao servidor');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Desconectado do servidor:', reason);
    });

    this.socket.on('error', (data: { message: string; code?: string }) => {
      console.error('❌ Erro do servidor:', data.message);
    });
  }

  /**
   * Listeners para eventos do jogo
   */
  onQueueStatus(callback: (data: QueueStatus) => void): void {
    this.socket?.on('queue-status', callback);
  }

  onMatchFound(callback: (data: MatchFound) => void): void {
    this.socket?.on('match-found', callback);
  }

  onGameStart(callback: (gameState: GameState) => void): void {
    this.socket?.on('game-start', callback);
  }

  onMoveMade(callback: (data: { move: Move; gameState: GameState }) => void): void {
    this.socket?.on('move-made', callback);
  }

  onGameEnd(callback: (data: GameEndResult) => void): void {
    this.socket?.on('game-end', callback);
  }

  onOpponentDisconnected(callback: () => void): void {
    this.socket?.on('opponent-disconnected', callback);
  }

  onOpponentReconnected(callback: () => void): void {
    this.socket?.on('opponent-reconnected', callback);
  }

  onQueueLeft(callback: () => void): void {
    this.socket?.on('queue-left', callback);
  }

  /**
   * Remover todos os listeners
   */
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService; 