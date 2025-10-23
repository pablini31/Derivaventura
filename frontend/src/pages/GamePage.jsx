import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Bomb as BombIcon, Snowflake, ArrowLeft } from 'lucide-react'
import { io } from 'socket.io-client'
import ZombieCharacter from '../components/ZombieCharacter'

function GamePage() {
  const navigate = useNavigate()
  const [socket, setSocket] = useState(null)
  const [gameState, setGameState] = useState({
    vidas: 5,
    puntuacion: 0,
    aciertos: 0,
    comodines: { bombas: 1, copos: 1 }
  })
  const [preguntaActual, setPreguntaActual] = useState(null)
  const [gameStatus, setGameStatus] = useState('waiting') // waiting, playing, won, lost
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [zombies, setZombies] = useState([])
  const [nivel, setNivel] = useState(1)
  const [tiempoCongelado, setTiempoCongelado] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username')

    if (!token || !username) {
      navigate('/login')
      return
    }

    // Conectar al servidor Socket.IO
    const newSocket = io('http://localhost:3000', {
      auth: { token }
    })

    newSocket.on('connect', () => {
      console.log('Conectado al servidor de juego')
      setGameStatus('connected')
    })

    newSocket.on('estado-juego-actualizado', (data) => {
      console.log('Estado actualizado:', data)
      setGameState({
        vidas: data.vidasRestantes,
        puntuacion: data.puntuacionActual,
        aciertos: data.aciertosActuales,
        comodines: data.comodines
      })

      if (data.esCorrecta !== undefined) {
        setFeedback(data.esCorrecta ? 'correct' : 'incorrect')
        
        // Si es correcta, eliminar el zombie más cercano
        if (data.esCorrecta) {
          setZombies(prev => prev.slice(1))
        }
        
        setTimeout(() => setFeedback(null), 1500)
      }
    })

    newSocket.on('pregunta-nueva', (pregunta) => {
      console.log('Nueva pregunta:', pregunta)
      setPreguntaActual(pregunta)
      setSelectedAnswer(null)
      
      // Agregar nuevo zombie con la derivada
      const newZombie = {
        id: Date.now(),
        derivada: pregunta.enunciado_funcion,
        position: 0, // 0 = inicio, 100 = torre
        speed: 1
      }
      setZombies(prev => [...prev, newZombie])
    })

    newSocket.on('game-over', (data) => {
      console.log('Game Over:', data)
      setGameStatus('lost')
    })

    newSocket.on('nivel-completado', (data) => {
      console.log('Nivel completado:', data)
      setGameStatus('won')
    })

    newSocket.on('juego-limpio', () => {
      console.log('¡Bomba activada!')
      setPreguntaActual(null)
      // Eliminar todos los zombies
      setZombies([])
    })

    newSocket.on('juego-congelado', (data) => {
      console.log('¡Juego congelado!', data)
      setTiempoCongelado(true)
      setTimeout(() => setTiempoCongelado(false), data.duracion || 5000)
    })

    newSocket.on('error-juego', (data) => {
      console.error('Error en el juego:', data)
      alert(data.mensaje)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [navigate])

  const iniciarNivel = () => {
    if (socket) {
      socket.emit('iniciar-nivel', nivel)
      setGameStatus('playing')
      setZombies([])
    }
  }

  // Efecto para mover zombies
  useEffect(() => {
    if (gameStatus !== 'playing' || tiempoCongelado) return

    const interval = setInterval(() => {
      setZombies(prev => {
        const updated = prev.map(zombie => ({
          ...zombie,
          position: zombie.position + zombie.speed
        }))
        
        // Verificar si algún zombie llegó a la torre (position >= 95)
        const zombieReachedTower = updated.some(z => z.position >= 95)
        if (zombieReachedTower && gameState.vidas > 0) {
          // El backend manejará la pérdida de vida
          return updated.filter(z => z.position < 95)
        }
        
        return updated
      })
    }, 100)

    return () => clearInterval(interval)
  }, [gameStatus, gameState.vidas, tiempoCongelado])

  const enviarRespuesta = (respuesta) => {
    if (!preguntaActual || selectedAnswer !== null) return
    
    setSelectedAnswer(respuesta)
    socket.emit('enviar-respuesta', {
      idPregunta: preguntaActual.idPregunta,
      respuesta: respuesta
    })
  }

  const usarComodin = (tipo) => {
    if (socket) {
      socket.emit('usar-comodin', { tipo })
    }
  }

  const salir = () => {
    if (socket) {
      socket.disconnect()
    }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen p-2 md:p-4">
      <div className="max-w-5xl mx-auto">
        {/* Botón volver */}
        <button onClick={salir} className="mb-4 text-purple-400 hover:text-purple-300 flex items-center gap-2 text-game text-lg">
          <ArrowLeft size={20} />
          <span>Volver al menú</span>
        </button>

        {/* Título del juego */}
        <div className="text-center mb-4">
          <h1 
            className="text-pixel text-3xl md:text-4xl inline-block" 
            style={{ 
              color: '#FFD700',
              textShadow: '3px 3px 0px #000',
              borderBottom: '4px solid transparent',
              borderImage: 'linear-gradient(90deg, #00FFFF 0%, #FF00FF 100%) 1',
              paddingBottom: '8px'
            }}
          >
            Derivazombies
          </h1>
        </div>

        {/* Contenedor principal del juego */}
        <div 
          className="bg-gradient-to-b from-orange-900/40 to-orange-800/40 rounded-xl p-4 shadow-2xl" 
          style={{ 
            border: '8px solid #8B6914',
            boxShadow: '0 0 30px rgba(139, 105, 20, 0.5), inset 0 0 20px rgba(0,0,0,0.3)'
          }}
        >
          {gameStatus === 'waiting' || gameStatus === 'connected' ? (
            <div className="flex items-center justify-center" style={{ minHeight: '500px' }}>
              <div className="text-center">
                <h2 className="text-pixel text-3xl text-white mb-6">
                  ¿LISTO PARA JUGAR?
                </h2>
                <button onClick={iniciarNivel} className="btn-pixel-success text-xl px-8 py-4">
                  INICIAR NIVEL {nivel}
                </button>
              </div>
            </div>
          ) : gameStatus === 'playing' ? (
            <>
              {/* Header del juego - Nivel, Vidas, Puntuación, Progreso */}
              <div className="bg-slate-900/80 border-4 border-slate-700 rounded-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
                {/* Nivel */}
                <div className="flex items-center gap-2">
                  <span className="text-game text-lg text-white">Nivel: <span className="text-yellow-400 font-bold">{nivel}</span></span>
                </div>

                {/* Vidas */}
                <div className="flex items-center gap-2">
                  <span className="text-game text-lg text-white">Vidas: <span className="text-red-400 font-bold">{gameState.vidas}</span></span>
                  <div className="flex gap-1">
                    {[...Array(gameState.vidas)].map((_, i) => (
                      <Heart key={i} className="text-red-500 fill-red-500" size={20} />
                    ))}
                  </div>
                </div>

                {/* Puntuación */}
                <div className="flex items-center gap-2">
                  <span className="text-game text-lg text-white">Puntuación: <span className="text-green-400 font-bold">{gameState.puntuacion}</span></span>
                </div>

                {/* Progreso */}
                <div className="flex items-center gap-2">
                  <span className="text-game text-lg text-white">Progreso: <span className="text-blue-400 font-bold">{gameState.aciertos}/6</span></span>
                </div>

                {/* Comodines */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => usarComodin('bomba')}
                    disabled={gameState.comodines.bombas === 0}
                    className={`px-3 py-2 rounded border-2 flex items-center gap-1 text-sm ${
                      gameState.comodines.bombas > 0 
                        ? 'bg-red-600 border-red-800 hover:bg-red-700 text-white cursor-pointer' 
                        : 'bg-gray-600 border-gray-800 text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                    title="Bomba: Elimina todos los zombies"
                  >
                    <BombIcon size={16} />
                    <span className="text-game">{gameState.comodines.bombas}</span>
                  </button>
                  <button
                    onClick={() => usarComodin('copo')}
                    disabled={gameState.comodines.copos === 0}
                    className={`px-3 py-2 rounded border-2 flex items-center gap-1 text-sm ${
                      gameState.comodines.copos > 0 
                        ? 'bg-blue-600 border-blue-800 hover:bg-blue-700 text-white cursor-pointer' 
                        : 'bg-gray-600 border-gray-800 text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                    title="Copo: Congela el tiempo"
                  >
                    <Snowflake size={16} />
                    <span className="text-game">{gameState.comodines.copos}</span>
                  </button>
                  <button
                    className="px-3 py-2 rounded border-2 bg-gray-700 border-gray-800 text-white flex items-center gap-1 text-sm cursor-not-allowed opacity-50"
                    disabled
                    title="Próximamente"
                  >
                    <span className="text-2xl">⏰</span>
                  </button>
                </div>
              </div>

              {/* Campo de batalla - Estilo tower defense */}
              <div className="relative bg-gradient-to-b from-sky-400 to-green-600 border-4 border-slate-700 rounded-lg overflow-hidden" style={{ height: '300px' }}>
                {/* Sol decorativo */}
                <div className="absolute top-4 right-8 text-6xl animate-pulse" style={{ animationDuration: '3s' }}>
                  ☀️
                </div>

                {/* Suelo/Césped */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-green-700 to-green-800 border-t-4 border-green-900"></div>

                {/* Torre del jugador (derecha) */}
                <div className="absolute right-4 bottom-8 flex flex-col items-center z-10">
                  <div className="text-6xl">🏰</div>
                  <div className="text-game text-sm text-white bg-black/50 px-2 py-1 rounded mt-1">TORRE</div>
                </div>

                {/* Zombies con derivadas */}
                {zombies.map((zombie) => (
                  <div
                    key={zombie.id}
                    className="absolute bottom-8 transition-all duration-100 z-20"
                    style={{ 
                      left: `${zombie.position}%`,
                      transform: 'translateX(-50%)',
                      filter: tiempoCongelado ? 'brightness(0.5) saturate(0.5)' : 'none'
                    }}
                  >
                    <ZombieCharacter 
                      equation={zombie.derivada} 
                      position={zombie.position}
                      isMoving={!tiempoCongelado}
                    />
                  </div>
                ))}

                {/* Indicador de tiempo congelado */}
                {tiempoCongelado && (
                  <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center z-30">
                    <div className="text-pixel text-4xl text-white animate-pulse">
                      ❄️ CONGELADO ❄️
                    </div>
                  </div>
                )}
              </div>

              {/* Panel de pregunta y respuestas */}
              <div className="mt-4">
                {preguntaActual ? (
                  <div className="bg-slate-900/90 border-4 border-slate-700 rounded-lg p-4">
                    {/* Feedback visual */}
                    {feedback && (
                      <div className={`text-center text-pixel text-2xl mb-3 ${
                        feedback === 'correct' ? 'text-green-400' : 'text-red-400'
                      } animate-pulse`}>
                        {feedback === 'correct' ? '¡CORRECTO! ✓' : '¡INCORRECTO! ✗'}
                      </div>
                    )}

                    {/* Título */}
                    <h3 className="text-game text-xl text-blue-300 text-center mb-3">
                      Resuelve la derivada
                    </h3>

                    {/* Enunciado de la derivada */}
                    <div className="bg-black/50 border-2 border-white/30 rounded-lg p-4 mb-4">
                      <p className="text-game text-2xl md:text-3xl text-white text-center font-bold">
                        Deriva: {preguntaActual.enunciado_funcion}
                      </p>
                    </div>

                    {/* Opciones de respuesta */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'A', value: preguntaActual.respuesta_correcta },
                        { label: 'B', value: preguntaActual.opcion_b },
                        { label: 'C', value: preguntaActual.opcion_c },
                        { label: 'D', value: preguntaActual.opcion_d }
                      ].map((opcion) => (
                        <button
                          key={opcion.label}
                          onClick={() => enviarRespuesta(opcion.value)}
                          disabled={selectedAnswer !== null}
                          className={`p-3 md:p-4 text-game border-3 rounded-lg transition-all ${
                            selectedAnswer === opcion.value
                              ? 'bg-blue-600 border-blue-400 scale-105'
                              : 'bg-slate-700/80 border-slate-500 hover:bg-slate-600'
                          } ${selectedAnswer !== null ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
                        >
                          <div className="text-white text-base md:text-lg font-bold text-center">{opcion.value}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/90 border-4 border-slate-700 rounded-lg p-8">
                    <div className="text-center">
                      <div className="text-game text-2xl text-blue-300 animate-pulse">
                        Esperando siguiente pregunta...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : gameStatus === 'won' ? (
            <div className="flex items-center justify-center" style={{ minHeight: '500px' }}>
              <div className="text-center bg-green-900/50 border-4 border-green-500 rounded-xl p-8">
                <div className="text-7xl mb-4">🏆</div>
                <h2 className="text-pixel text-4xl text-green-400 mb-6 animate-bounce">
                  ¡VICTORIA!
                </h2>
                <p className="text-game text-2xl text-white mb-4">
                  ¡Defendiste la torre exitosamente!
                </p>
                <p className="text-game text-2xl text-yellow-300 mb-8">
                  Puntuación Final: <span className="font-bold">{gameState.puntuacion}</span>
                </p>
                <button onClick={salir} className="btn-pixel-success text-xl px-8 py-4">
                  VOLVER AL MENÚ
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center" style={{ minHeight: '500px' }}>
              <div className="text-center bg-red-900/50 border-4 border-red-500 rounded-xl p-8">
                <div className="text-7xl mb-4">☠️</div>
                <h2 className="text-pixel text-4xl text-red-400 mb-6 shake-animation">
                  GAME OVER
                </h2>
                <p className="text-game text-2xl text-white mb-4">
                  Los zombies destruyeron tu torre
                </p>
                <p className="text-game text-2xl text-yellow-300 mb-8">
                  Puntuación Final: <span className="font-bold">{gameState.puntuacion}</span>
                </p>
                <button onClick={salir} className="btn-pixel text-xl px-8 py-4">
                  VOLVER AL MENÚ
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default GamePage
