import { useState } from 'react'
import { useSocket } from './hooks/useSocket'
import { useGame } from './hooks/useGame'
import { BotDifficulty } from './types/matchmaking.types'
import './App.css'

function App() {
  const { isConnected, isConnecting } = useSocket()
  const { 
    gameState, 
    isMyTurn, 
    makeMove, 
    gameResult, 
    clearResult,
    inQueue,
    queueStatus,
    joinQueue,
    leaveQueue
  } = useGame()
  const [selectedDifficulty, setSelectedDifficulty] = useState<BotDifficulty>(BotDifficulty.MEDIUM)
  const [showDifficultySelector, setShowDifficultySelector] = useState(false)

  const startMatchmaking = (botDifficulty: BotDifficulty) => {
    joinQueue(botDifficulty)
    setShowDifficultySelector(false)
  }

  // Status da conexão
  if (isConnecting) {
    return (
      <div className="app">
        <div className="connecting">
          <h2>🔌 Conectando ao servidor...</h2>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="app">
        <div className="disconnected">
          <h2>❌ Desconectado do servidor</h2>
          <p>Verifique se o backend está a correr na porta 3000</p>
        </div>
      </div>
    )
  }

  // Modal de resultado do jogo
  if (gameResult) {
    const getResultMessage = () => {
      switch (gameResult.result) {
        case 'win':
          return { emoji: '🎉', title: 'Vitória!', message: 'Parabéns, ganhaste!' }
        case 'lose':
          return { emoji: '😔', title: 'Derrota', message: 'Mais sorte na próxima!' }
        case 'draw':
          return { emoji: '🤝', title: 'Empate!', message: 'Bom jogo!' }
        default:
          return { emoji: '🎮', title: 'Jogo Terminado', message: '' }
      }
    }

    const result = getResultMessage()

    return (
      <div className="app">
        <div className="game-result">
          <div className="result-content">
            <div className="result-emoji">{result.emoji}</div>
            <h2>{result.title}</h2>
            <p>{result.message}</p>
            
            <div className="result-actions">
              <button 
                className="play-again-button"
                onClick={() => {
                  clearResult()
                  setShowDifficultySelector(true)
                }}
              >
                🎯 Jogar Novamente
              </button>
              
              <button 
                className="back-button"
                onClick={() => {
                  clearResult()
                  leaveQueue()
                }}
              >
                🏠 Menu Principal
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Se estiver num jogo
  if (gameState) {
    return (
      <div className="app">
        <div className="game-container">
          <h1>🎮 Jogo do Galo</h1>
          
          <div className="game-info">
            <p>Jogo: {gameState.id.slice(-8)}</p>
            <p>Vez de: {gameState.currentPlayer}</p>
            <p>Status: {isMyTurn ? '🎯 Sua vez!' : '⏳ Aguardando adversário...'}</p>
          </div>

          <div className="game-board">
            {gameState.board.flat().map((cell, index) => {
              const row = Math.floor(index / 3);
              const col = index % 3;
              return (
                <button
                  key={`${row}-${col}`}
                  className={`board-cell ${cell ? 'filled' : ''} ${isMyTurn ? 'clickable' : ''} ${
                    cell === 'X' ? 'symbol-x' : cell === 'O' ? 'symbol-o' : ''
                  }`}
                  onClick={() => makeMove(row, col)}
                  disabled={!isMyTurn || cell !== null}
                >
                  {cell || ''}
                </button>
              );
            })}
          </div>

          <div className="players">
            <div className="player">
              <strong>X:</strong> {gameState.players.X.name}
              {gameState.players.X.isBot && ' 🤖'}
            </div>
            <div className="player">
              <strong>O:</strong> {gameState.players.O.name}
              {gameState.players.O.isBot && ' 🤖'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Seletor de dificuldade
  if (showDifficultySelector) {
    return (
      <div className="app">
        <div className="difficulty-selector">
          <h1>🎮 Escolher Dificuldade</h1>
          <p>Se não encontrarmos adversário humano, criaremos um bot:</p>
          
          <div className="difficulty-options">
            <button 
              className={`difficulty-button ${selectedDifficulty === BotDifficulty.EASY ? 'selected' : ''}`}
              onClick={() => setSelectedDifficulty(BotDifficulty.EASY)}
            >
              <div className="difficulty-icon">😊</div>
              <div className="difficulty-title">Fácil</div>
              <div className="difficulty-description">Bot faz jogadas aleatórias (70%)</div>
            </button>
            
            <button 
              className={`difficulty-button ${selectedDifficulty === BotDifficulty.MEDIUM ? 'selected' : ''}`}
              onClick={() => setSelectedDifficulty(BotDifficulty.MEDIUM)}
            >
              <div className="difficulty-icon">🤔</div>
              <div className="difficulty-title">Médio</div>
              <div className="difficulty-description">Bot usa estratégia básica</div>
            </button>
            
            <button 
              className={`difficulty-button ${selectedDifficulty === BotDifficulty.HARD ? 'selected' : ''}`}
              onClick={() => setSelectedDifficulty(BotDifficulty.HARD)}
            >
              <div className="difficulty-icon">🧠</div>
              <div className="difficulty-title">Difícil</div>
              <div className="difficulty-description">Bot imbatível (minimax completo)</div>
            </button>
          </div>
          
          <div className="difficulty-actions">
            <button 
              className="start-queue-button"
              onClick={() => startMatchmaking(selectedDifficulty)}
            >
              🎯 Procurar Jogo
            </button>
            
            <button 
              className="back-button"
              onClick={() => setShowDifficultySelector(false)}
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Tela inicial
  return (
    <div className="app">
      <div className="main-menu">
        <h1>🎮 Jogo do Galo</h1>
        <p>✅ Conectado ao servidor!</p>
        
        {inQueue ? (
          <div className="queue-status">
            <h2>🔍 Procurando adversário...</h2>
            <p>
              {queueStatus 
                ? `Posição na fila: ${queueStatus.position} | Tempo restante: ${queueStatus.countdown}s`
                : 'Aguardando na fila de matchmaking'
              }
            </p>
            <div className="loading-spinner">⏳</div>
            <button 
              className="cancel-queue-button"
              onClick={() => {
                leaveQueue()
              }}
            >
              ❌ Cancelar
            </button>
          </div>
        ) : (
          <div className="menu-actions">
            <button 
              className="play-button"
              onClick={() => setShowDifficultySelector(true)}
            >
              🎯 Jogar
            </button>
            <p className="game-info">
              Sistema de matchmaking automático:<br/>
              • Procura por adversário humano (15s)<br/>
              • Bot automático se não encontrar<br/>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
