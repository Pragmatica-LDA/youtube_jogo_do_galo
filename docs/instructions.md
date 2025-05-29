# Jogo do Galo - Documento de Requisitos

## Visão Geral
Aplicação web moderna do jogo do galo com sistema de matchmaking em tempo real, interface responsiva e experiência de utilizador optimizada.

## Arquitectura Técnica

### Frontend
- **Framework**: React 18+ com TypeScript
- **Styling**: CSS Modules + Design System moderno
- **Estado**: Context API ou Redux Toolkit
- **Comunicação**: Socket.io-client para tempo real
- **Build**: Vite
- **UI/UX**: Interface minimalista com micro-animações suaves

### Backend
- **Runtime**: Node.js com Express
- **Linguagem**: TypeScript
- **WebSockets**: Socket.io para comunicação em tempo real
- **Base de dados**: Redis para sessões temporárias
- **API**: RESTful + WebSocket events

## Funcionalidades Principais

### Sistema de Matchmaking
- **Procura de jogador**: Utilizador entra numa fila de espera
- **Timeout**: 15 segundos para encontrar adversário humano
- **Bot automático**: Se não encontrar jogador, entra bot com IA
- **Matching**: Jogadores são automaticamente emparelhados
- **Reconexão**: Sistema de recuperação de jogos interrompidos
- **Cancelamento de fila**: ✅ **NOVO** - Utilizador pode cancelar a procura a qualquer momento

### Sistema de Cancelamento de Fila ✅ IMPLEMENTADO

#### Funcionalidades:
- **Cancelar procura**: Botão "❌ Cancelar" disponível durante matchmaking
- **Estado sincronizado**: Frontend e backend mantêm estado da fila sincronizado
- **Feedback visual**: Informações de posição na fila e tempo restante
- **Confirmação**: Sistema confirma saída da fila com evento `queue-left`

#### Fluxo de Cancelamento:
1. Utilizador entra na fila (botão "🎯 Procurar Jogo")
2. Vê status da fila: posição e countdown
3. Pode cancelar a qualquer momento com botão "❌ Cancelar"
4. Backend remove da fila e confirma
5. Frontend volta ao menu principal

#### Implementação Técnica:

**Backend:**
```typescript
// Evento para sair da fila
socket.on('leave-queue', () => {
  if (socket.data.inQueue) {
    matchmakingService.removePlayerFromQueue(socket.id);
    socket.data.inQueue = false;
    socket.emit('queue-left'); // Confirmação
  }
});
```

**Frontend:**
```typescript
// Hook useGame com gestão de fila
const { inQueue, queueStatus, joinQueue, leaveQueue } = useGame();

// Listener para confirmação de saída
socketService.onQueueLeft(() => {
  setInQueue(false);
  setQueueStatus(null);
});
```

#### Estados da Fila:
- **`inQueue: boolean`** - Se o jogador está na fila
- **`queueStatus: QueueStatus | null`** - Informações da posição e tempo
- **Sincronização automática** - Estados são actualizados em tempo real

### Modos de Jogo
1. **Humano vs Humano**: Matchmaking automático
2. **Humano vs Bot**: Activado automaticamente após timeout

### Interface do Utilizador

#### Design Visual
- **Paleta de cores**: Tons neutros modernos (grays, blues)
- **Tipografia**: Inter ou sistema fonts
- **Layout**: Grid 3x3 centralizado e responsivo
- **Animações**: Transições suaves (hover, clique, vitória)
- **Feedback visual**: Estados hover, loading, vitória/derrota

#### Componentes
- **Grelha de jogo**: 3x3 interactive grid
- **Status bar**: Indica vez do jogador, estado do jogo
- **Matchmaking UI**: Loading, contador de tempo, estado da fila
- **Modal de resultado**: Vitória/empate/derrota
- **Chat simples**: Emojis básicos entre jogadores

#### Responsividade
- **Desktop**: Layout optimizado para mouse
- **Tablet**: Touch-friendly com tamanhos ajustados
- **Mobile**: Interface compacta e acessível

## Especificações Técnicas

### Estrutura do Projeto
```
jogo_do_galo/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── sockets/
│   │   ├── utils/
│   │   ├── types/
│   │   └── app.ts
│   ├── dist/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Game/
│   │   │   ├── Matchmaking/
│   │   │   ├── UI/
│   │   │   └── Layout/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── dist/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
├── docs/
└── README.md
```

### Backend API

#### Estrutura de Pastas Backend
```
backend/src/
├── controllers/
│   ├── GameController.ts      // Lógica de controlo do jogo
│   ├── StatsController.ts     // Estatísticas e métricas
│   └── HealthController.ts    // Health checks
├── services/
│   ├── GameService.ts         // Lógica de negócio do jogo
│   ├── MatchmakingService.ts  // Sistema de matchmaking
│   ├── BotService.ts          // IA e lógica do bot
│   ├── RedisService.ts        // Gestão de Redis
│   └── ValidationService.ts   // Validações de jogadas
├── middleware/
│   ├── auth.ts               // Autenticação (futuro)
│   ├── validation.ts         // Validação de requests
│   ├── rateLimiting.ts       // Rate limiting
│   └── errorHandler.ts       // Gestão de erros
├── models/
│   ├── Game.ts               // Modelo do jogo
│   ├── Player.ts             // Modelo do jogador
│   ├── Move.ts               // Modelo da jogada
│   └── MatchmakingQueue.ts   // Modelo da fila
├── routes/
│   ├── api.ts                // Rotas principais da API
│   ├── health.ts             // Rotas de health check
│   └── stats.ts              // Rotas de estatísticas
├── sockets/
│   ├── gameSocket.ts         // WebSocket handlers do jogo
│   ├── matchmakingSocket.ts  // WebSocket handlers do matchmaking
│   ├── events.ts             // Definição de eventos
│   └── socketManager.ts      // Gestão de conexões
├── utils/
│   ├── logger.ts             // Sistema de logging
│   ├── constants.ts          // Constantes da aplicação
│   ├── helpers.ts            // Funções auxiliares
│   └── gameLogic.ts          // Lógica pura do jogo do galo
├── types/
│   ├── game.types.ts         // Types do jogo
│   ├── player.types.ts       // Types do jogador
│   ├── socket.types.ts       // Types dos sockets
│   └── api.types.ts          // Types da API
└── app.ts                    // Entry point da aplicação
```

#### Configuração Backend
```typescript
// backend/src/app.ts estrutura base
interface ServerConfig {
  port: number;
  corsOrigins: string[];
  redisUrl: string;
  environment: 'development' | 'production' | 'test';
}

// Dependências principais
dependencies: {
  "express": "^4.18.0",
  "socket.io": "^4.7.0",
  "redis": "^4.6.0",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "express-rate-limit": "^6.7.0",
  "winston": "^3.10.0",
  "joi": "^17.9.0",
  "uuid": "^9.0.0"
}
```

#### WebSocket Events
```typescript
// Cliente -> Servidor
'join-queue'     // Entrar na fila de matchmaking
'leave-queue'    // ✅ NOVO - Sair da fila de matchmaking
'make-move'      // Realizar jogada
'leave-game'     // Abandonar jogo
'reconnect'      // Reconectar ao jogo

// Servidor -> Cliente
'match-found'    // Adversário encontrado
'game-start'     // Início do jogo
'move-made'      // Jogada realizada
'game-end'       // Fim do jogo
'queue-status'   // Estado da fila
'queue-left'     // ✅ NOVO - Confirmação de saída da fila
```

#### REST Endpoints
- `GET /api/health` - Health check
- `GET /api/stats` - Estatísticas gerais
- `POST /api/games/:id/moves` - Registar jogada (backup)

### Frontend Architecture

#### Estrutura de Pastas Frontend
```
frontend/src/
├── components/                   // 📁 Estrutura criada (componentes futuros)
│   ├── Game/                     // (vazio - para implementar)
│   ├── Matchmaking/              // (vazio - para implementar)
│   ├── UI/                       // (vazio - para implementar)
│   └── Layout/                   // (vazio - para implementar)
├── hooks/                        // ✅ IMPLEMENTADO
│   ├── useSocket.ts              // ✅ Hook para WebSocket (completo)
│   └── useGame.ts                // ✅ Hook para estado do jogo (completo)
├── services/                     // ✅ IMPLEMENTADO
│   └── socketService.ts          // ✅ Cliente WebSocket (completo)
├── types/                        // ✅ IMPLEMENTADO
│   ├── game.types.ts             // ✅ Types do jogo (completo)
│   └── matchmaking.types.ts      // ✅ Types do matchmaking (completo)
├── utils/                        // 📁 Estrutura criada (funcionalidades futuras)
├── styles/                       // 📁 Estrutura criada
│   └── components/               // (vazio - para estilos modulares)
├── App.tsx                       // ✅ Componente principal IMPLEMENTADO
├── App.css                       // ✅ Estilos globais IMPLEMENTADOS
├── main.tsx                      // ✅ Entry point (Vite padrão)
├── index.css                     // ✅ Estilos base (Vite padrão)
└── vite-env.d.ts                 // ✅ Types do Vite
```

#### Estado de Implementação Frontend

**✅ COMPLETO:**
- Configuração base do Vite + React + TypeScript
- Sistema de tipos compatível com backend
- Serviço WebSocket com todas as funcionalidades
- Hooks personalizados para socket e jogo
- Interface funcional consolidada no App.tsx
- Estilos modernos e responsivos
- Compilação sem erros

**📋 PRÓXIMOS PASSOS (estrutura preparada):**
- Modularizar componentes do App.tsx para pastas específicas
- Implementar componentes reutilizáveis na pasta UI/
- Adicionar utilitários para validação local
- Criar estilos modulares por componente

#### Configuração Frontend
```typescript
// frontend/package.json dependências implementadas
dependencies: {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "socket.io-client": "^4.7.0",
  "clsx": "^2.0.0",
  "framer-motion": "^10.12.0"  // Para animações futuras
}

devDependencies: {
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@vitejs/plugin-react": "^4.0.0",
  "typescript": "^5.0.0",
  "vite": "^4.4.0"
}
```

#### Estado da Aplicação (Implementado)
```typescript
// useGame.ts - Estado principal do jogo ✅ ACTUALIZADO
interface UseGameReturn {
  gameState: GameState | null;
  mySymbol: PlayerSymbol | null;
  isMyTurn: boolean;
  isGameActive: boolean;
  gameResult: GameEndResult | null;
  inQueue: boolean;                    // ✅ NOVO - Estado da fila
  queueStatus: QueueStatus | null;     // ✅ NOVO - Informações da fila
  makeMove: (row: number, col: number) => void;
  leaveGame: () => void;
  clearResult: () => void;
  joinQueue: (botDifficulty?: BotDifficulty) => void;  // ✅ NOVO
  leaveQueue: () => void;              // ✅ NOVO
}

// useSocket.ts - Estado da conexão
interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  disconnect: () => void;
  reconnect: () => void;
}
```

## Experiência do Utilizador

### Fluxo Principal
1. **Landing**: Utilizador clica "Jogar"
2. **Selecção**: Escolhe dificuldade do bot (Fácil/Médio/Difícil)
3. **Matchmaking**: Entra na fila, vê posição e countdown
4. **Cancelamento**: ✅ **NOVO** - Pode cancelar procura a qualquer momento
5. **Match**: Encontra adversário humano ou bot (se timeout/cancelamento)
6. **Jogo**: Interface limpa, feedback claro
7. **Resultado**: Modal com resultado, opção de jogar novamente

### Estados da Interface
- **Loading**: Skeleton loaders suaves
- **Error**: Mensagens friendly com retry
- **Success**: Micro-animações de confirmação
- **Empty**: Estados vazios informativos

## Requisitos Não-Funcionais

### Performance
- **Loading inicial**: < 2 segundos
- **Latência**: < 100ms para jogadas
- **Matchmaking**: < 15 segundos garantidos

### Acessibilidade
- **Keyboard navigation**: Tab, Enter, Space
- **Screen readers**: ARIA labels completos
- **Contrast**: WCAG AA compliance
- **Focus management**: Estados visuais claros

### Compatibilidade
- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Devices**: Desktop, tablet, mobile
- **Screen sizes**: 320px - 2560px

## Métricas e Analytics

### Tracking Events
- Tempo médio de matchmaking
- Taxa de conclusão de jogos
- Performance vs bot vs humanos
- Abandono de jogos

### Logs Importantes
- Erros de conexão WebSocket
- Timeouts de matchmaking
- Latência de jogadas
- Crashes de jogo

## Roadmap de Implementação

### Fase 1: Core (MVP) ✅ COMPLETO
- [x] Setup básico React + Node
- [x] Interface do jogo funcional
- [x] Lógica básica do jogo do galo
- [x] WebSocket setup
- [x] Sistema de matchmaking completo
- [x] Bot com IA minimax (3 níveis)
- [x] Backend totalmente funcional
- [x] Frontend básico operacional
- [x] **Sistema de cancelamento de fila** ✅ **NOVO**
- [x] **Selecção de dificuldade do bot** ✅ IMPLEMENTADO
- [x] **Gestão de estado da fila sincronizada** ✅ IMPLEMENTADO

### Fase 2: Frontend Modular (Próximo)
- [ ] Componentes modulares (Game/, UI/, Layout/)
- [ ] Hook useMatchmaking para estado da fila
- [ ] Componentes reutilizáveis (Button, Modal, etc.)
- [ ] Estilos modulares por componente

### Fase 3: Polish
- [ ] Animações e micro-interações
- [ ] Melhorias de UX (feedback visual)
- [ ] Testing abrangente
- [ ] Performance optimization

### Fase 4: Enhancements
- [ ] Chat entre jogadores
- [ ] Múltiplas dificuldades de bot
- [ ] Estatísticas de jogador
- [ ] Themes/customization
