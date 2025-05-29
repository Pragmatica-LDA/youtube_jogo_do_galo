import { EventEmitter } from 'events';
export declare class MatchmakingService extends EventEmitter {
    private queue;
    private readonly TIMEOUT_MS;
    private playerTimeouts;
    constructor();
    /**
     * Adiciona jogador à fila de matchmaking
     */
    addPlayerToQueue(playerId: string, socketId: string): void;
    /**
     * Remove jogador da fila
     */
    removePlayerFromQueue(playerId: string): void;
    /**
     * Verifica se jogador está na fila
     */
    isPlayerInQueue(playerId: string): boolean;
    /**
     * Obtém posição do jogador na fila
     */
    getPlayerPosition(playerId: string): number;
    /**
     * Obtém estatísticas da fila
     */
    getQueueStats(): {
        playersInQueue: number;
        averageWaitTime: number;
    };
    /**
     * Inicia timeout para criação de bot
     */
    private startPlayerTimeout;
    /**
     * Limpa timeout do jogador
     */
    private clearPlayerTimeout;
    /**
     * Handles timeout - cria match com bot
     */
    private handlePlayerTimeout;
    /**
     * Cria match entre dois jogadores
     */
    private createMatch;
    /**
     * Atualiza posições na fila após remoção
     */
    private updateQueuePositions;
    /**
     * Calcula tempo restante para timeout
     */
    private getRemainingTime;
    /**
     * Calcula tempo médio de espera
     */
    private calculateAverageWaitTime;
    /**
     * Cleanup - remove todos os timeouts
     */
    cleanup(): void;
}
//# sourceMappingURL=MatchmakingService.d.ts.map