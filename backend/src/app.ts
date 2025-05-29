import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from './types/socket.types';
import { MatchmakingService } from './services/MatchmakingService';
import { GameService } from './services/GameService';
import { BotService } from './services/BotService';
import { BotDifficulty } from './types/player.types';

const app = express();
const server = createServer(app);

// Configuração do CORS para Socket.io
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Inicializar services
const matchmakingService = new MatchmakingService();
const gameService = new GameService();
const botService = new BotService();

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json());

// Rotas básicas
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/stats', (req, res) => {
  const matchmakingStats = matchmakingService.getQueueStats();
  const gameStats = gameService.getStats();
  
  res.json({
    connectedPlayers: io.sockets.sockets.size,
    ...matchmakingStats,
    ...gameStats,
    timestamp: new Date().toISOString()
  });
});

// Event listeners para matchmaking
matchmakingService.on('match-found', (match) => {
  console.log(`🎮 Match encontrado: ${match.gameId}`);
  
  // Criar jogo
  const gameState = gameService.createHumanVsHumanGame(match.player1.playerId, match.player2.playerId);
  
  // Notificar jogadores
  const player1Socket = io.sockets.sockets.get(match.player1.socketId);
  const player2Socket = io.sockets.sockets.get(match.player2.socketId);
  
  if (player1Socket && player2Socket) {
    // Determinar símbolos
    const player1Symbol = gameState.players.X.id === match.player1.playerId ? 'X' : 'O';
    const player2Symbol = player1Symbol === 'X' ? 'O' : 'X';
    
    player1Socket.emit('match-found', {
      gameId: gameState.id,
      opponent: gameState.players[player2Symbol],
      yourSymbol: player1Symbol
    });
    
    player2Socket.emit('match-found', {
      gameId: gameState.id,
      opponent: gameState.players[player1Symbol],
      yourSymbol: player2Symbol
    });
    
    // Iniciar jogo
    player1Socket.emit('game-start', gameState);
    player2Socket.emit('game-start', gameState);
    
    // Atualizar dados das sockets
    player1Socket.data.currentGameId = gameState.id;
    player2Socket.data.currentGameId = gameState.id;
    player1Socket.data.inQueue = false;
    player2Socket.data.inQueue = false;
  }
});

matchmakingService.on('bot-match-created', async (botMatch) => {
  console.log(`🤖 Match com bot criado: ${botMatch.gameId}`);
  
  const playerSocket = io.sockets.sockets.get(botMatch.player.socketId);
  const botDifficulty = playerSocket?.data?.preferredBotDifficulty || BotDifficulty.MEDIUM;
  
  // Criar jogo contra bot com dificuldade escolhida
  const gameState = gameService.createHumanVsBotGame(botMatch.player.playerId, botDifficulty);
  
  if (playerSocket) {
    playerSocket.emit('match-found', {
      gameId: gameState.id,
      opponent: gameState.players.O, // Bot é sempre O
      yourSymbol: 'X' // Humano é sempre X
    });
    
    playerSocket.emit('game-start', gameState);
    
    // Atualizar dados da socket
    playerSocket.data.currentGameId = gameState.id;
    playerSocket.data.inQueue = false;
  }
});

matchmakingService.on('queue-update', (update) => {
  const playerSocket = io.sockets.sockets.get(update.playerId);
  if (playerSocket) {
    playerSocket.emit('queue-status', {
      position: update.position,
      countdown: update.countdown
    });
  }
});

// WebSocket handlers
io.on('connection', (socket) => {
  console.log(`🔌 Player conectado: ${socket.id}`);
  
  // Inicializar dados da socket
  socket.data = {
    playerId: socket.id,
    inQueue: false
  };

  socket.on('join-queue', (data?: { botDifficulty?: BotDifficulty }) => {
    console.log(`🔍 Player ${socket.id} entrou na fila`);
    const botDifficulty = data?.botDifficulty || BotDifficulty.MEDIUM;
    socket.data.preferredBotDifficulty = botDifficulty;
    matchmakingService.addPlayerToQueue(socket.id, socket.id);
    socket.data.inQueue = true;
  });

  socket.on('leave-queue', () => {
    console.log(`🚪 Player ${socket.id} saiu da fila`);
    if (socket.data.inQueue) {
      matchmakingService.removePlayerFromQueue(socket.id);
      socket.data.inQueue = false;
      socket.emit('queue-left');
    }
  });

  socket.on('make-move', async (data) => {
    console.log(`🎯 Player ${socket.id} fez jogada:`, data);
    
    const result = gameService.makeMove(data.gameId, data.row, data.col, socket.id);
    
    if (!result.success) {
      socket.emit('error', { message: result.error || 'Erro desconhecido' });
      return;
    }
    
    const gameState = result.gameState!;
    const move = gameState.moves[gameState.moves.length - 1];
    
    // Notificar todos os jogadores do jogo
    const playerXSocket = io.sockets.sockets.get(gameState.players.X.socketId!);
    const playerOSocket = io.sockets.sockets.get(gameState.players.O.socketId!);
    
    if (playerXSocket) {
      playerXSocket.emit('move-made', { move, gameState });
    }
    
    if (playerOSocket && !gameState.players.O.isBot) {
      playerOSocket.emit('move-made', { move, gameState });
    }
    
    // Verificar se jogo terminou
    if (result.isGameFinished) {
      const gameResult = result.gameResult!;
      
      // Notificar resultado
      if (playerXSocket) {
        const result = gameResult.winner === 'X' ? 'win' : gameResult.isDraw ? 'draw' : 'lose';
        playerXSocket.emit('game-end', { result, gameState });
        playerXSocket.data.currentGameId = undefined;
      }
      
      if (playerOSocket && !gameState.players.O.isBot) {
        const result = gameResult.winner === 'O' ? 'win' : gameResult.isDraw ? 'draw' : 'lose';
        playerOSocket.emit('game-end', { result, gameState });
        playerOSocket.data.currentGameId = undefined;
      }
      
      return;
    }
    
    // Verificar se é vez do bot
    if (gameService.isBotTurn(data.gameId)) {
      const botPlayer = gameService.getBotPlayer(data.gameId);
      if (botPlayer) {
        // Fazer jogada do bot com delay
        setTimeout(async () => {
          try {
            const botMove = await botService.getBotMoveWithDelay(
              gameState.board,
              gameState.currentPlayer,
              botPlayer.difficulty
            );
            
            const botResult = gameService.makeMove(data.gameId, botMove.row, botMove.col, botPlayer.id);
            
            if (botResult.success) {
              const updatedGameState = botResult.gameState!;
              const botMoveData = updatedGameState.moves[updatedGameState.moves.length - 1];
              
              // Notificar jogada do bot
              if (playerXSocket) {
                playerXSocket.emit('move-made', { move: botMoveData, gameState: updatedGameState });
              }
              
              // Verificar se bot terminou o jogo
              if (botResult.isGameFinished) {
                const gameResult = botResult.gameResult!;
                
                if (playerXSocket) {
                  const result = gameResult.winner === 'X' ? 'win' : gameResult.isDraw ? 'draw' : 'lose';
                  playerXSocket.emit('game-end', { result, gameState: updatedGameState });
                  playerXSocket.data.currentGameId = undefined;
                }
              }
            }
          } catch (error) {
            console.error('Erro na jogada do bot:', error);
          }
        }, 100); // Pequeno delay para melhor UX
      }
    }
  });

  socket.on('leave-game', (gameId) => {
    console.log(`🚪 Player ${socket.id} abandonou jogo ${gameId}`);
    
    const abandonedGame = gameService.abandonGame(gameId, socket.id);
    if (abandonedGame) {
      // Notificar outro jogador (se não for bot)
      const otherPlayer = abandonedGame.players.X.id === socket.id ? 
        abandonedGame.players.O : abandonedGame.players.X;
      
      if (!otherPlayer.isBot && otherPlayer.socketId) {
        const otherSocket = io.sockets.sockets.get(otherPlayer.socketId);
        if (otherSocket) {
          const result = otherPlayer.id === abandonedGame.winner ? 'win' : 'lose';
          otherSocket.emit('game-end', { result, gameState: abandonedGame });
          otherSocket.data.currentGameId = undefined;
        }
      }
    }
    
    socket.data.currentGameId = undefined;
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Player desconectado: ${socket.id}`);
    
    // Remover da fila se estiver lá
    if (socket.data.inQueue) {
      matchmakingService.removePlayerFromQueue(socket.id);
    }
    
    // Marcar como desconectado nos jogos
    gameService.markPlayerDisconnected(socket.id);
    
    // TODO: Implementar reconexão automática
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🎮 Jogo do Galo Backend iniciado!`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  
  // Cleanup periódico
  setInterval(() => {
    gameService.cleanup();
  }, 60 * 60 * 1000); // Cada hora
}); 