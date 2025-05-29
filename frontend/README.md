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

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento com hot reload

# Build
npm run build        # Cria build optimizado para produção
npm run preview      # Pré-visualiza build de produção

# Linting e Formatação
npm run lint         # Verifica código com ESLint
npm run lint:fix     # Corrige problemas automaticamente
```

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── hooks/                    # ✅ Custom Hooks
│   │   ├── useSocket.ts          # ✅ Gestão de WebSocket
│   │   └── useGame.ts            # ✅ Estado principal do jogo
│   ├── services/                 # ✅ Serviços
│   │   └── socketService.ts      # ✅ Cliente WebSocket
│   ├── types/                    # ✅ Definições TypeScript
│   │   ├── game.types.ts         # ✅ Tipos do jogo
│   │   └── matchmaking.types.ts  # ✅ Tipos do matchmaking
│   ├── components/               # 📁 Componentes futuros
│   ├── utils/                    # 📁 Utilitários
│   ├── styles/                   # 📁 Estilos modulares
│   ├── App.tsx                   # ✅ Componente principal
│   ├── App.css                   # ✅ Estilos globais
│   └── main.tsx                  # ✅ Entry point
├── public/                       # Arquivos estáticos
├── dist/                         # Build de produção
└── README.md                     # Este arquivo
```

**Legenda:**
- ✅ = Implementado e funcional
- 📁 = Estrutura preparada para desenvolvimento futuro

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
