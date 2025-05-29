"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const uuid_1 = require("uuid");
const game_types_1 = require("../types/game.types");
const player_types_1 = require("../types/player.types");
const gameLogic_1 = require("../utils/gameLogic");
class GameService {
    constructor() {
        this.games = new Map();
    }
    /**
     * Cria novo jogo entre dois jogadores humanos
     */
    createHumanVsHumanGame(player1Id, player2Id) {
        const gameId = (0, uuid_1.v4)();
        const player1 = {
            id: player1Id,
            name: `Jogador ${player1Id.slice(-4)}`,
            isBot: false,
            socketId: player1Id,
            connected: true,
            joinedAt: new Date()
        };
        const player2 = {
            id: player2Id,
            name: `Jogador ${player2Id.slice(-4)}`,
            isBot: false,
            socketId: player2Id,
            connected: true,
            joinedAt: new Date()
        };
        // Randomizar quem joga primeiro
        const isPlayer1First = Math.random() < 0.5;
        const gameState = {
            id: gameId,
            board: (0, gameLogic_1.createEmptyBoard)(),
            currentPlayer: 'X',
            status: game_types_1.GameStatus.PLAYING,
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
    createHumanVsBotGame(playerId, botDifficulty = player_types_1.BotDifficulty.MEDIUM) {
        const gameId = (0, uuid_1.v4)();
        const humanPlayer = {
            id: playerId,
            name: `Jogador ${playerId.slice(-4)}`,
            isBot: false,
            socketId: playerId,
            connected: true,
            joinedAt: new Date()
        };
        const botPlayer = {
            id: `bot-${(0, uuid_1.v4)()}`,
            name: this.generateBotName(),
            isBot: true,
            difficulty: botDifficulty,
            connected: true,
            joinedAt: new Date()
        };
        // Humano sempre joga primeiro contra bot
        const gameState = {
            id: gameId,
            board: (0, gameLogic_1.createEmptyBoard)(),
            currentPlayer: 'X',
            status: game_types_1.GameStatus.PLAYING,
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
    makeMove(gameId, row, col, playerId) {
        const game = this.games.get(gameId);
        if (!game) {
            return { success: false, error: 'Jogo não encontrado' };
        }
        if (game.status !== game_types_1.GameStatus.PLAYING) {
            return { success: false, error: 'Jogo não está activo' };
        }
        // Verificar se é a vez do jogador
        const currentPlayerData = game.players[game.currentPlayer];
        if (currentPlayerData.id !== playerId) {
            return { success: false, error: 'Não é a sua vez' };
        }
        // Verificar se a jogada é válida
        if (!(0, gameLogic_1.isValidMove)(game.board, row, col)) {
            return { success: false, error: 'Jogada inválida' };
        }
        try {
            // Fazer a jogada
            const newBoard = (0, gameLogic_1.makeMove)(game.board, row, col, game.currentPlayer);
            // Criar movimento
            const move = {
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
            const gameResult = (0, gameLogic_1.checkWinner)(newBoard);
            const finished = (0, gameLogic_1.isGameFinished)(newBoard);
            if (finished) {
                game.status = game_types_1.GameStatus.FINISHED;
                game.winner = gameResult.winner;
            }
            else {
                // Alternar jogador
                game.currentPlayer = (0, gameLogic_1.getOpponentSymbol)(game.currentPlayer);
            }
            this.games.set(gameId, game);
            return {
                success: true,
                gameState: game,
                isGameFinished: finished,
                gameResult: finished ? gameResult : undefined
            };
        }
        catch (error) {
            return { success: false, error: 'Erro ao processar jogada' };
        }
    }
    /**
     * Obter estado do jogo
     */
    getGame(gameId) {
        return this.games.get(gameId) || null;
    }
    /**
     * Verificar se é a vez do bot
     */
    isBotTurn(gameId) {
        const game = this.games.get(gameId);
        if (!game)
            return false;
        const currentPlayer = game.players[game.currentPlayer];
        return currentPlayer.isBot;
    }
    /**
     * Obter jogador bot do jogo
     */
    getBotPlayer(gameId) {
        const game = this.games.get(gameId);
        if (!game)
            return null;
        const playerX = game.players.X;
        const playerO = game.players.O;
        if (playerX.isBot)
            return playerX;
        if (playerO.isBot)
            return playerO;
        return null;
    }
    /**
     * Marcar jogador como desconectado
     */
    markPlayerDisconnected(playerId) {
        const affectedGames = [];
        this.games.forEach((game, gameId) => {
            const playerX = game.players.X;
            const playerO = game.players.O;
            if (playerX.id === playerId) {
                playerX.connected = false;
                affectedGames.push(gameId);
            }
            else if (playerO.id === playerId) {
                playerO.connected = false;
                affectedGames.push(gameId);
            }
        });
        return affectedGames;
    }
    /**
     * Marcar jogador como reconectado
     */
    markPlayerReconnected(playerId, socketId) {
        const affectedGames = [];
        this.games.forEach((game, gameId) => {
            const playerX = game.players.X;
            const playerO = game.players.O;
            if (playerX.id === playerId) {
                playerX.connected = true;
                playerX.socketId = socketId;
                affectedGames.push(gameId);
            }
            else if (playerO.id === playerId) {
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
    abandonGame(gameId, playerId) {
        const game = this.games.get(gameId);
        if (!game)
            return null;
        game.status = game_types_1.GameStatus.ABANDONED;
        // O outro jogador ganha por abandono
        const playerX = game.players.X;
        const playerO = game.players.O;
        if (playerX.id === playerId) {
            game.winner = 'O';
        }
        else if (playerO.id === playerId) {
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
        const activeGames = Array.from(this.games.values()).filter(g => g.status === game_types_1.GameStatus.PLAYING).length;
        const finishedGames = Array.from(this.games.values()).filter(g => g.status === game_types_1.GameStatus.FINISHED).length;
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
    cleanup(maxAgeMs = 24 * 60 * 60 * 1000) {
        const now = Date.now();
        this.games.forEach((game, gameId) => {
            const gameAge = now - game.updatedAt.getTime();
            if (gameAge > maxAgeMs && game.status !== game_types_1.GameStatus.PLAYING) {
                this.games.delete(gameId);
            }
        });
    }
    /**
     * Gerar nome aleatório para bot
     */
    generateBotName() {
        const names = [
            'Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta',
            'Calculador', 'Estrategista', 'Magnus Bot', 'Deep Think',
            'AI-nstein', 'Robo Galo', 'ByteBot', 'Logic Master'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }
}
exports.GameService = GameService;
//# sourceMappingURL=GameService.js.map