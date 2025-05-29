"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchmakingService = void 0;
const events_1 = require("events");
const uuid_1 = require("uuid");
class MatchmakingService extends events_1.EventEmitter {
    constructor() {
        super();
        this.queue = [];
        this.TIMEOUT_MS = 15000; // 15 segundos
        this.playerTimeouts = new Map();
    }
    /**
     * Adiciona jogador à fila de matchmaking
     */
    addPlayerToQueue(playerId, socketId) {
        // Verificar se jogador já está na fila
        if (this.isPlayerInQueue(playerId)) {
            return;
        }
        const player = {
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
        }
        else {
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
    removePlayerFromQueue(playerId) {
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
    isPlayerInQueue(playerId) {
        return this.queue.some(p => p.playerId === playerId);
    }
    /**
     * Obtém posição do jogador na fila
     */
    getPlayerPosition(playerId) {
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
    startPlayerTimeout(player) {
        const timeout = setTimeout(() => {
            this.handlePlayerTimeout(player);
        }, this.TIMEOUT_MS);
        this.playerTimeouts.set(player.playerId, timeout);
    }
    /**
     * Limpa timeout do jogador
     */
    clearPlayerTimeout(playerId) {
        const timeout = this.playerTimeouts.get(playerId);
        if (timeout) {
            clearTimeout(timeout);
            this.playerTimeouts.delete(playerId);
        }
    }
    /**
     * Handles timeout - cria match com bot
     */
    handlePlayerTimeout(player) {
        // Remove da fila
        this.removePlayerFromQueue(player.playerId);
        // Cria match com bot
        const gameId = (0, uuid_1.v4)();
        const botMatch = {
            gameId,
            player
        };
        this.emit('bot-match-created', botMatch);
    }
    /**
     * Cria match entre dois jogadores
     */
    createMatch(player1, player2) {
        const gameId = (0, uuid_1.v4)();
        const match = {
            gameId,
            player1,
            player2
        };
        this.emit('match-found', match);
    }
    /**
     * Atualiza posições na fila após remoção
     */
    updateQueuePositions() {
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
    getRemainingTime(player) {
        const elapsed = Date.now() - player.joinedQueueAt.getTime();
        const remaining = Math.max(0, this.TIMEOUT_MS - elapsed);
        return Math.ceil(remaining / 1000);
    }
    /**
     * Calcula tempo médio de espera
     */
    calculateAverageWaitTime() {
        if (this.queue.length === 0)
            return 0;
        const totalWaitTime = this.queue.reduce((sum, player) => {
            return sum + (Date.now() - player.joinedQueueAt.getTime());
        }, 0);
        return totalWaitTime / this.queue.length;
    }
    /**
     * Cleanup - remove todos os timeouts
     */
    cleanup() {
        this.playerTimeouts.forEach(timeout => clearTimeout(timeout));
        this.playerTimeouts.clear();
        this.queue = [];
    }
}
exports.MatchmakingService = MatchmakingService;
//# sourceMappingURL=MatchmakingService.js.map