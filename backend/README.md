# Jogo do Galo - Backend

Backend completo para o jogo do galo com sistema de matchmaking em tempo real, IA avançada e WebSockets.

## 🚀 Funcionalidades Implementadas

### ✅ Sistema de Matchmaking
- **Fila automática** com timeout de 15 segundos
- **Match instantâneo** entre jogadores humanos
- **Bot automático** quando não há adversários
- **Estatísticas** de fila em tempo real

### ✅ Lógica de Jogo Completa
- **Validação** de jogadas
- **Detecção** de vitórias e empates
- **Estados** persistentes de jogo
- **Abandono** e reconexão

### ✅ IA do Bot (Minimax)
- **3 níveis de dificuldade:**
  - **Easy**: 70% aleatório, 30% optimal
  - **Medium**: Minimax com profundidade 4
  - **Hard**: Minimax completo (invencível)
- **Delay realista** simulando "pensamento"
- **Nomes aleatórios** para personalização

### ✅ WebSocket em Tempo Real
- **Comunicação bidirecional** instantânea
- **Eventos tipados** com TypeScript
- **Gestão de conexões** robusta
- **Rate limiting** e segurança

## 📡 API Endpoints

### REST API
```
GET  /health           # Health check do servidor
GET  /api/stats        # Estatísticas em tempo real
```

### WebSocket Events

#### Cliente → Servidor
```typescript
'join-queue'           # Entrar na fila de matchmaking
'make-move'           # Fazer jogada no tabuleiro
'leave-game'          # Abandonar jogo atual
'reconnect-game'      # Reconectar a jogo existente
```

#### Servidor → Cliente
```typescript
'queue-status'        # Estado da fila (posição, countdown)
'match-found'         # Adversário encontrado
'game-start'          # Início do jogo
'move-made'           # Jogada realizada
'game-end'            # Final do jogo
'error'               # Mensagem de erro
```

## 🎯 Exemplo de Uso

### 1. Conectar ao WebSocket
```javascript
const socket = io('ws://localhost:3000');
```

### 2. Entrar na Fila
```javascript
socket.emit('join-queue');

socket.on('queue-status', (data) => {
  console.log(`Posição: ${data.position}, Countdown: ${data.countdown}s`);
});
```

### 3. Jogo Encontrado
```javascript
socket.on('match-found', (data) => {
  console.log(`Jogo: ${data.gameId}`);
  console.log(`Adversário: ${data.opponent.name}`);
  console.log(`Você é: ${data.yourSymbol}`);
});
```

### 4. Fazer Jogada
```javascript
socket.emit('make-move', {
  gameId: 'uuid-do-jogo',
  row: 1,
  col: 1
});
```

### 5. Receber Updates
```javascript
socket.on('move-made', (data) => {
  console.log('Nova jogada:', data.move);
  console.log('Estado:', data.gameState);
});

socket.on('game-end', (data) => {
  console.log(`Resultado: ${data.result}`);
});
```

## 🗂️ Estrutura do Código

```
src/
├── services/
│   ├── MatchmakingService.ts    # Sistema de filas e timeout
│   ├── GameService.ts           # Gestão de jogos
│   └── BotService.ts            # IA com minimax
├── utils/
│   └── gameLogic.ts             # Lógica pura do jogo
├── types/
│   ├── game.types.ts            # Tipos do jogo
│   ├── player.types.ts          # Tipos de jogadores
│   └── socket.types.ts          # Tipos WebSocket
└── app.ts                       # Entry point
```

## 🧪 Como Testar

### 1. Iniciar Servidor
```bash
npm run dev
```

### 2. Testar Health Check
```bash
curl http://localhost:3000/health
```

### 3. Ver Estatísticas
```bash
curl http://localhost:3000/api/stats
```

### 4. Testar WebSocket
```javascript
// Usar browser console ou cliente WebSocket
const socket = io('ws://localhost:3000');
socket.emit('join-queue');
```

## 📊 Métricas Disponíveis

```json
{
  "connectedPlayers": 0,        // Players conectados via WebSocket
  "playersInQueue": 0,          // Players na fila de matchmaking
  "averageWaitTime": 0,         // Tempo médio de espera (ms)
  "totalGames": 0,              // Total de jogos criados
  "activeGames": 0,             // Jogos atualmente em progresso
  "finishedGames": 0,           // Jogos terminados
  "gamesInMemory": 0,           // Jogos armazenados em memória
  "timestamp": "2025-01-01T..."
}
```

## ⚙️ Configuração

### Variáveis de Ambiente
```bash
PORT=3000                        # Porta do servidor
FRONTEND_URL=http://localhost:5173  # URL do frontend (CORS)
NODE_ENV=development             # Ambiente
```

### Scripts NPM
```bash
npm run dev      # Desenvolvimento com hot reload
npm run build    # Compilar TypeScript
npm run start    # Executar versão compilada
npm run clean    # Limpar pasta dist
```

## 🎮 Fluxo de Jogo

1. **Player entra na fila** → `join-queue`
2. **Sistema procura match** por 15 segundos
3. **Match encontrado** → Cria jogo PvP
4. **Timeout** → Cria jogo vs Bot
5. **Jogadas alternadas** com validação
6. **Bot responde** com delay realista
7. **Detecção automática** de vitória/empate
8. **Cleanup** automático de jogos antigos

## 🔒 Segurança Implementada

- **CORS** configurado para frontend
- **Helmet** para headers de segurança
- **Rate limiting** (100 requests/15min)
- **Validação** rigorosa de jogadas
- **Error handling** robusto

## 🚀 Performance

- **Minimax otimizado** para jogo do galo
- **Cleanup automático** de jogos antigos
- **Memory-efficient** game storage
- **Async bot processing** sem bloquear

## 📈 Próximos Passos

- [ ] Redis para persistência (scaling)
- [ ] Sistema de ranking/estatísticas
- [ ] Reconexão automática robusta
- [ ] Múltiplas salas/torneios
- [ ] Chat entre jogadores 