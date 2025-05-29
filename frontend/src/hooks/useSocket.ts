import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import socketService from '../services/socketService';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const connect = () => {
      setIsConnecting(true);
      
      try {
        const socket = socketService.connect();
        socketRef.current = socket;

        socket.on('connect', () => {
          setIsConnected(true);
          setIsConnecting(false);
        });

        socket.on('disconnect', () => {
          setIsConnected(false);
          setIsConnecting(false);
        });

      } catch (error) {
        console.error('Erro ao conectar:', error);
        setIsConnecting(false);
      }
    };

    connect();

    // Cleanup na desmontagem
    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    disconnect: () => socketService.disconnect(),
    reconnect: () => {
      socketService.disconnect();
      const socket = socketService.connect();
      socketRef.current = socket;
    }
  };
} 