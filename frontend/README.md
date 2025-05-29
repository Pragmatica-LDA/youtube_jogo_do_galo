# 🎮 Jogo do Galo - Frontend

Interface moderna em React para o clássico jogo do galo com sistema de matchmaking em tempo real e oponentes IA.

## 📋 Funcionalidades

- ✅ **Matchmaking Automático**: Sistema de fila com timeout de 15s
- ✅ **Oponentes IA**: Bot com 3 níveis de dificuldade (Fácil/Médio/Difícil)
- ✅ **Tempo Real**: Comunicação WebSocket para jogos instantâneos
- ✅ **Interface Responsiva**: Design moderno adaptável a todos os dispositivos
- ✅ **Sistema de Fila**: Cancelamento de procura a qualquer momento
- ✅ **Estado Sincronizado**: Frontend e backend sempre em sincronia
- ✅ **Feedback Visual**: Animações e indicadores de estado claros

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+ 
- NPM ou Yarn
- Backend do jogo em execução (porta 3000)

### Instalação

```bash
# Clonar o repositório (se não tiver)
cd frontend

# Instalar dependências
npm install

# Configurar ambiente (ver secção abaixo)
cp .env.example .env

# Executar em modo desenvolvimento
npm run dev

# Ou executar build para produção
npm run build
npm run preview
```

## ⚙️ Configuração de Ambiente

### Variáveis de Ambiente Disponíveis

Cria um ficheiro `.env` na pasta `frontend/` com as seguintes configurações:

```env
# Backend Configuration (obrigatório)
VITE_BACKEND_URL=http://localhost:3000

# Environment (opcional)
VITE_NODE_ENV=development

# Debug (opcional)
VITE_DEBUG=false
```

### 🔧 Configurações por Ambiente

#### **Desenvolvimento Local:**
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_DEBUG=true
```

#### **Produção:**
```env
VITE_BACKEND_URL=https://yourdomain.com:3000
VITE_DEBUG=false
```

#### **Docker/Containers:**
```env
VITE_BACKEND_URL=http://backend:3000
```

### 🌐 Auto-detecção Inteligente

O frontend detecta automaticamente o ambiente:

1. **Variável Explícita**: Usa `VITE_BACKEND_URL` se definida
2. **Detecção de Domínio**: Se não for localhost, assume mesmo protocolo/domínio 
3. **Fallback**: Default para `http://localhost:3000`

```javascript
// Exemplos de detecção automática:
// https://myapp.com → backend: https://myapp.com
// http://localhost:5173 → backend: http://localhost:3000
// https://poc4s8w0okwgowskcog4cwoc.apps-prag.com → backend: https://poc4s8w0okwgowskcog4cwoc.apps-prag.com
```

#### **⚡ Para Coolify/PaaS:**
Deixa `VITE_BACKEND_URL` vazio (ou comenta a linha) para auto-detecção:
```env
# VITE_BACKEND_URL=  # Auto-detecção activada
VITE_DEBUG=false
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento (com host 0.0.0.0)
npm run dev

# Build para produção
npm run build

# Preview da build (com host 0.0.0.0)
npm run preview

# Linting
npm run lint
```

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   ├── hooks/           # React hooks customizados
│   │   ├── useGame.ts   # Estado principal do jogo
│   │   └── useSocket.ts # Gestão de WebSocket
│   ├── services/        # Serviços externos
│   │   └── socketService.ts # WebSocket service
│   ├── types/           # Definições TypeScript
│   │   ├── game.types.ts
│   │   └── matchmaking.types.ts
│   └── App.tsx          # Componente principal
├── .env                 # Configurações de ambiente
├── .env.example         # Exemplo de configurações
└── vite.config.ts       # Configuração Vite
```

## 🔌 WebSocket Connection

O sistema conecta automaticamente ao backend via WebSocket com:

- **Reconnexão automática**: 5 tentativas com delay de 1s
- **Timeout**: 10 segundos
- **Transporte**: WebSocket apenas
- **Fallback inteligente**: Múltiplas estratégias de URL

## 🎯 Funcionalidades do Jogo

### Estados da Aplicação:
- **Connecting**: A conectar ao servidor
- **Disconnected**: Servidor offline
- **Menu**: Selecção de dificuldade
- **Queue**: Na fila de matchmaking
- **Game**: Jogo a decorrer
- **Result**: Resultado do jogo

### Fluxo do Jogo:
1. **Conectar** → Servidor WebSocket
2. **Escolher** → Dificuldade do bot
3. **Fila** → Procurar adversário (15s timeout)
4. **Jogo** → Jogar contra humano ou bot
5. **Resultado** → Vitória/Empate/Derrota

## 🐛 Troubleshooting

### Problemas Comuns:

#### ❌ "Desconectado do servidor"
```bash
# Verificar se backend está a correr
curl http://localhost:3000/health

# Verificar configuração
echo $VITE_BACKEND_URL
```

#### ❌ "Blocked request host not allowed"
```bash
# Adicionar allowedHosts no vite.config.ts
preview: {
  allowedHosts: true
}
```

#### ❌ CORS Error
```bash
# Verificar se FRONTEND_URL está correcto no backend
```

## 🚀 Deploy

### Build para Produção:
```bash
npm run build
# Ficheiros gerados em: dist/
```

### Deploy com Nginx:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

### Deploy com Coolify/Docker:
- **Build Command**: `npm run build`
- **Start Command**: `npm run preview`
- **Publish Directory**: `/dist`

## 📊 Tecnologias

- **React 19** + **TypeScript**
- **Vite** (Build tool)
- **Socket.io-client** (WebSocket)
- **Framer Motion** (Animações)
- **CSS3** (Styling moderno)

## 🤝 Contribuição

1. Fork o projeto
2. Cria branch para feature (`git checkout -b feature/amazing-feature`)
3. Commit as mudanças (`git commit -m 'Add amazing feature'`)
4. Push para branch (`git push origin feature/amazing-feature`)
5. Abre Pull Request

## 📄 Licença

Este projeto está sob licença MIT. Ver `LICENSE` para mais detalhes.

## 🎯 Como Jogar

### 1. **Menu Principal**
- Clique em "🎯 Jogar" para iniciar

### 2. **Selecção de Dificuldade**
- **😊 Fácil**: Bot faz 70% jogadas aleatórias
- **🤔 Médio**: Bot usa estratégia básica
- **🧠 Difícil**: Bot imbatível (algoritmo minimax)

### 3. **Matchmaking**
- Sistema procura adversário humano por 15s
- Mostra posição na fila e tempo restante
- Pode cancelar com "❌ Cancelar" a qualquer momento
- Se não encontrar humano, cria bot automaticamente

### 4. **Jogo**
- Interface 3x3 intuitiva
- Indicadores claros de vez e estado
- X e O com cores distintas (vermelho/azul)

### 5. **Resultado**
- Modal com resultado (Vitória/Derrota/Empate)
- Opções: "🎯 Jogar Novamente" ou "🏠 Menu Principal"
- Reset automático após 8 segundos

## 🔧 Tecnologias

### Core
- **React 18**: Framework principal
- **TypeScript**: Type safety
- **Vite**: Build tool moderno e rápido

### Comunicação
- **Socket.io-client**: WebSocket para tempo real
- **REST API**: Backup e estatísticas

### Styling
- **CSS3**: Estilos modernos com gradientes
- **Flexbox/Grid**: Layout responsivo
- **Custom Properties**: Variáveis CSS para temas

### Futuro
- **Framer Motion**: Animações avançadas (preparado)
- **Clsx**: Gestão de classes condicionais (instalado)

## 🎨 Design System

### Cores
```css
--primary: #3b82f6      /* Azul principal */
--primary-dark: #2563eb /* Azul escuro */
--success: #10b981      /* Verde sucesso */
--danger: #ef4444       /* Vermelho perigo */
--warning: #f59e0b      /* Amarelo aviso */
--gray-50: #f9fafb      /* Cinza claro */
--gray-900: #111827     /* Cinza escuro */
```

### Símbolos do Jogo
- **X**: `color: #dc2626` (Vermelho)
- **O**: `color: #2563eb` (Azul)

## 📱 Responsividade

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

### Adaptações
- Grid do jogo ajusta tamanho automaticamente
- Botões touch-friendly em mobile
- Menu compacto em ecrãs pequenos

## 🔌 Integração Backend

### WebSocket Events

**Cliente → Servidor:**
```typescript
'join-queue'     // Entrar na fila
'leave-queue'    // Sair da fila  
'make-move'      // Fazer jogada
'leave-game'     // Abandonar jogo
```

**Servidor → Cliente:**
```typescript
'queue-status'   // Estado da fila
'queue-left'     // Confirmação de saída
'match-found'    // Adversário encontrado
'game-start'     // Início do jogo
'move-made'      // Jogada realizada
'game-end'       // Fim do jogo
```

### Configuração
```typescript
// .env.local (opcional)
VITE_BACKEND_URL=http://localhost:3000
```

## 🧪 Estado de Desenvolvimento

### ✅ **Funcional e Testado**
- Conexão WebSocket estável
- Matchmaking com timeout
- Jogos humano vs humano
- Jogos humano vs bot (3 dificuldades)
- Cancelamento de fila
- Estados sincronizados
- Interface responsiva

### 📋 **Próximos Passos** (Fase 2)
- Componentes modulares (Game/, UI/, Layout/)
- Hook useMatchmaking separado
- Componentes reutilizáveis (Button, Modal)
- Estilos modulares por componente
- Testes unitários

### 🚀 **Futuro** (Fases 3-4)
- Animações e micro-interações
- Chat entre jogadores
- Estatísticas de jogador
- Temas personalizáveis
- PWA (Progressive Web App)

## 🤝 Contribuição

### Estrutura de Commits
```bash
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refactoring
test: testes
```

### Desenvolvimento
1. Fork do projeto
2. Criar branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adicionar nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Pull Request

## 📈 Performance

### Métricas Target
- **Loading inicial**: < 2s
- **Latência jogadas**: < 100ms
- **Bundle size**: < 500KB
- **First Paint**: < 1s

### Optimizações
- Code splitting automático (Vite)
- Tree shaking
- Minificação de assets
- Lazy loading de componentes (futuro)

## 🐛 Debugging

### Logs Úteis
```javascript
// Console do browser
console.log('🔌 Estado WebSocket:', socket.connected)
console.log('🎮 Estado do jogo:', gameState)
console.log('📊 Queue status:', queueStatus)
```

### Problemas Comuns
- **Não conecta**: Verificar se backend está em `localhost:3000`
- **Não encontra jogos**: Abrir 2 abas/dispositivos para testar
- **Símbolos invisíveis**: Cache do browser, fazer hard refresh

## 📄 Licença

Este projeto é parte de um tutorial educacional.

## 👨‍💻 Autor

Desenvolvido como parte da série "YouTube - Jogo do Galo" por [Helder]

---

**🎮 Divirte-te a jogar!** 

Para dúvidas ou sugestões, consulta a documentação completa em `/docs/instructions.md`
