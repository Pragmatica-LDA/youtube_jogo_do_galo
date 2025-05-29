import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { MatchmakingPlayer } from '../types/player.types';

interface MatchFound {
  gameId: string;
  player1: MatchmakingPlayer;
  player2: MatchmakingPlayer;
}

interface BotMatchCreated {
  gameId: string;
  player: MatchmakingPlayer;
}

export class MatchmakingService extends EventEmitter {
  private queue: MatchmakingPlayer[] = [];
  private readonly TIMEOUT_MS = 15000; // 15 segundos
  private playerTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();
  }

  /**
   * Adiciona jogador à fila de matchmaking
   */
  addPlayerToQueue(playerId: string, socketId: string): void {
    // Verificar se jogador já está na fila
    if (this.isPlayerInQueue(playerId)) {
      return;
    }

    const player: MatchmakingPlayer = {
      playerId,
      socketId,
      joinedQueueAt: new Date()
    };

    // Tentar fazer match imediatamente
    const waitingPlayer = this.queue.shift();
    
    if (waitingPlayer) {
      // Match encontrado!
      this.clearPlayerTimeout(waitingPlayer.playerId);
      this.createMatch(waitingPlayer, player);
    } else {
      // Adicionar à fila e iniciar timeout
      this.queue.push(player);
      this.startPlayerTimeout(player);
      
      // Emitir status da fila
      this.emit('queue-update', {
        playerId: player.playerId,
        position: this.queue.length,
        countdown: this.TIMEOUT_MS / 1000
      });
    }
  }

  /**
   * Remove jogador da fila
   */
  removePlayerFromQueue(playerId: string): void {
    const index = this.queue.findIndex(p => p.playerId === playerId);
    
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.clearPlayerTimeout(playerId);
      
      // Atualizar posições na fila
      this.updateQueuePositions();
    }
  }

  /**
   * Verifica se jogador está na fila
   */
  isPlayerInQueue(playerId: string): boolean {
    return this.queue.some(p => p.playerId === playerId);
  }

  /**
   * Obtém posição do jogador na fila
   */
  getPlayerPosition(playerId: string): number {
    const index = this.queue.findIndex(p => p.playerId === playerId);
    return index !== -1 ? index + 1 : 0;
  }

  /**
   * Obtém estatísticas da fila
   */
  getQueueStats() {
    return {
      playersInQueue: this.queue.length,
      averageWaitTime: this.calculateAverageWaitTime()
    };
  }

  /**
   * Inicia timeout para criação de bot
   */
  private startPlayerTimeout(player: MatchmakingPlayer): void {
    const timeout = setTimeout(() => {
      this.handlePlayerTimeout(player);
    }, this.TIMEOUT_MS);

    this.playerTimeouts.set(player.playerId, timeout);
  }

  /**
   * Limpa timeout do jogador
   */
  private clearPlayerTimeout(playerId: string): void {
    const timeout = this.playerTimeouts.get(playerId);
    if (timeout) {
      clearTimeout(timeout);
      this.playerTimeouts.delete(playerId);
    }
  }

  /**
   * Handles timeout - cria match com bot
   */
  private handlePlayerTimeout(player: MatchmakingPlayer): void {
    // Remove da fila
    this.removePlayerFromQueue(player.playerId);
    
    // Cria match com bot
    const gameId = uuidv4();
    
    const botMatch: BotMatchCreated = {
      gameId,
      player
    };

    this.emit('bot-match-created', botMatch);
  }

  /**
   * Cria match entre dois jogadores
   */
  private createMatch(player1: MatchmakingPlayer, player2: MatchmakingPlayer): void {
    const gameId = uuidv4();
    
    const match: MatchFound = {
      gameId,
      player1,
      player2
    };

    this.emit('match-found', match);
  }

  /**
   * Atualiza posições na fila após remoção
   */
  private updateQueuePositions(): void {
    this.queue.forEach((player, index) => {
      this.emit('queue-update', {
        playerId: player.playerId,
        position: index + 1,
        countdown: this.getRemainingTime(player)
      });
    });
  }

  /**
   * Calcula tempo restante para timeout
   */
  private getRemainingTime(player: MatchmakingPlayer): number {
    const elapsed = Date.now() - player.joinedQueueAt.getTime();
    const remaining = Math.max(0, this.TIMEOUT_MS - elapsed);
    return Math.ceil(remaining / 1000);
  }

  /**
   * Calcula tempo médio de espera
   */
  private calculateAverageWaitTime(): number {
    if (this.queue.length === 0) return 0;
    
    const totalWaitTime = this.queue.reduce((sum, player) => {
      return sum + (Date.now() - player.joinedQueueAt.getTime());
    }, 0);
    
    return totalWaitTime / this.queue.length;
  }

  /**
   * Cleanup - remove todos os timeouts
   */
  cleanup(): void {
    this.playerTimeouts.forEach(timeout => clearTimeout(timeout));
    this.playerTimeouts.clear();
    this.queue = [];
  }
} 