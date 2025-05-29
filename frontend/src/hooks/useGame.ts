import { useState, useEffect, useCallback } from 'react';
import type { GameState, PlayerSymbol, Move } from '../types/game.types';
import type { GameEndResult, MatchFound, QueueStatus, BotDifficulty } from '../types/matchmaking.types';
import socketService from '../services/socketService';

interface UseGameReturn {
  gameState: GameState | null;
  mySymbol: PlayerSymbol | null;
  isMyTurn: boolean;
  isGameActive: boolean;
  gameResult: GameEndResult | null;
  inQueue: boolean;
  queueStatus: QueueStatus | null;
  makeMove: (row: number, col: number) => void;
  leaveGame: () => void;
  clearResult: () => void;
  joinQueue: (botDifficulty?: BotDifficulty) => void;
  leaveQueue: () => void;
}

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [mySymbol, setMySymbol] = useState<PlayerSymbol | null>(null);
  const [gameResult, setGameResult] = useState<GameEndResult | null>(null);
  const [inQueue, setInQueue] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);

  const isMyTurn = Boolean(
    gameState && 
    mySymbol && 
    gameState.currentPlayer === mySymbol &&
    gameState.status === 'playing'
  );

  const makeMove = useCallback((row: number, col: number) => {
    if (!gameState || !isMyTurn) return;
    
    socketService.makeMove(gameState.id, row, col);
  }, [gameState, isMyTurn]);

  const leaveGame = useCallback(() => {
    if (!gameState) return;
    
    socketService.leaveGame(gameState.id);
    setGameState(null);
    setMySymbol(null);
    setGameResult(null);
  }, [gameState]);

  const clearResult = useCallback(() => {
    setGameResult(null);
    setGameState(null);
    setMySymbol(null);
  }, []);

  const joinQueue = useCallback((botDifficulty?: BotDifficulty) => {
    socketService.joinQueue(botDifficulty);
    setInQueue(true);
    setQueueStatus(null);
    console.log('🔍 Entrar na fila com dificuldade:', botDifficulty);
  }, []);

  const leaveQueue = useCallback(() => {
    socketService.leaveQueue();
    setInQueue(false);
    setQueueStatus(null);
    console.log('🚪 Sair da fila');
  }, []);

  const isGameActive = gameState?.status === 'playing';

  useEffect(() => {
    // Listener para queue status
    socketService.onQueueStatus((data: QueueStatus) => {
      setQueueStatus(data);
      console.log('📊 Queue status:', data);
    });

    // Listener para sair da fila
    socketService.onQueueLeft(() => {
      setInQueue(false);
      setQueueStatus(null);
      console.log('✅ Saiu da fila confirmado');
    });

    // Listener para match encontrado - CRÍTICO para definir mySymbol
    socketService.onMatchFound((data: MatchFound) => {
      setMySymbol(data.yourSymbol);
      setInQueue(false);
      setQueueStatus(null);
      console.log('🎯 Match encontrado! Meu símbolo:', data.yourSymbol);
    });

    // Listener para início do jogo
    socketService.onGameStart((newGameState: GameState) => {
      setGameState(newGameState);
      setGameResult(null); // Limpar resultado anterior
      setInQueue(false); // Garantir que não está em fila
      setQueueStatus(null);
      console.log('🎮 Jogo iniciado:', newGameState);
    });

    // Listener para jogadas
    socketService.onMoveMade((data: { move: Move; gameState: GameState }) => {
      setGameState(data.gameState);
      console.log('🎯 Nova jogada:', data.move);
    });

    // Listener para fim do jogo
    socketService.onGameEnd((data: GameEndResult) => {
      setGameState(data.gameState);
      setGameResult(data);
      console.log('🏁 Jogo terminou:', data.result);
      
      // Reset automático após 8 segundos se não for manual
      setTimeout(() => {
        setGameState(null);
        setMySymbol(null);
        setGameResult(null);
      }, 8000);
    });

    // Cleanup
    return () => {
      // Os listeners serão removidos pelo useSocket
    };
  }, []);

  return {
    gameState,
    mySymbol,
    isMyTurn,
    isGameActive,
    gameResult,
    inQueue,
    queueStatus,
    makeMove,
    leaveGame,
    clearResult,
    joinQueue,
    leaveQueue
  };
} 