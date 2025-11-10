import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Bomb as BombIcon, Snowflake, ArrowLeft, Pause, Play } from 'lucide-react'
import { io } from 'socket.io-client'
import ZombieCharacter from '../components/ZombieCharacter'
import HouseBase from '../components/HouseBase'

function GamePage() {
  const navigate = useNavigate()
  const [socket, setSocket] = useState(null)
  const [gameState, setGameState] = useState({
    vidas: 3,
    puntuacion: 0,
    aciertos: 0,
    comodines: { bombas: 3, copos: 3 }
  })
  const [preguntaActual, setPreguntaActual] = useState(null)
  const [gameStatus, setGameStatus] = useState('waiting') // waiting, playing, won, lost
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [zombies, setZombies] = useState([])
  const [nivel, setNivel] = useState(1)
  const [mostrarSeleccionNivel, setMostrarSeleccionNivel] = useState(true)
  const [nombreNivel, setNombreNivel] = useState('Principiante')
  const [tiempoCongelado, setTiempoCongelado] = useState(false)
  const [casaBajoAtaque, setCasaBajoAtaque] = useState(false)
  const [modoNocturno, setModoNocturno] = useState(false)
  const [juegoPausado, setJuegoPausado] = useState(false)
  const [oleadaInfo, setOleadaInfo] = useState({
    actual: 1,
    total: 3,
    zombisRestantes: 0,
    enDescanso: false
  })
  const [preguntasIncorrectas, setPreguntasIncorrectas] = useState([])

  const nivelesDisponibles = [
    { id: 1, nombre: 'Principiante', oleadas: 3, descripcion: 'Perfecto para empezar' },
    { id: 2, nombre: 'Intermedio', oleadas: 4, descripcion: 'Un poco más de desafío' },
    { id: 3, nombre: 'Avanzado', oleadas: 5, descripcion: 'Para jugadores experimentados' },
    { id: 4, nombre: 'Experto', oleadas: 6, descripcion: '¡Solo para los más valientes!' }
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username')

    if (!token || !username) {
      navigate('/login')
      return
    }

    // Conectar al servidor Socket.IO
    const newSocket = io('http://localhost:3001', {
      auth: { token }
    })

    newSocket.on('connect', () => {
      console.log('Conectado al servidor de juego')
      setGameStatus('connected')
    })

    newSocket.on('estado-juego-actualizado', (data) => {
      console.log('Estado actualizado:', data)
      console.log('Comodines recibidos:', data.comodines)
      setGameState({
        vidas: data.vidasRestantes,
        puntuacion: data.puntuacionActual,
        aciertos: data.aciertosActuales,
        comodines: data.comodines || { bombas: 3, copos: 3 }
      })

      if (data.esCorrecta !== undefined) {
        setFeedback(data.esCorrecta ? 'correct' : 'incorrect')
        
        // Sistema de comodín aleatorio basado en aciertos del backend
        if (data.esCorrecta && data.aciertosActuales % 10 === 0 && data.aciertosActuales > 0) {
          console.log(`🎁 Activando comodín gratis! Aciertos: ${data.aciertosActuales}`)
          setFeedback('free-powerup')
          // El backend manejará agregar el comodín
          setTimeout(() => {
            console.log('Enviando evento comodin-gratis al backend')
            newSocket.emit('comodin-gratis')
          }, 500)
        }
        
        setTimeout(() => setFeedback(null), 1500)
      }

      // Si un zombi llegó a la base
      if (data.zombiLlego) {
        setFeedback('zombie-arrived')
        setCasaBajoAtaque(true)
        setTimeout(() => {
          setFeedback(null)
          setCasaBajoAtaque(false)
        }, 2000)
      }
    })

    newSocket.on('pregunta-nueva', (pregunta) => {
      console.log('Nueva pregunta:', pregunta)
      setPreguntaActual(pregunta)
      setSelectedAnswer(null)
    })

    // Nuevo evento para recibir estado completo del juego
    newSocket.on('zombis-actualizados', (data) => {
      setZombies(data.zombis.map(z => ({
        id: z.id,
        derivada: z.ecuacion,
        position: (z.posicion / 100) * 85, // Convertir a porcentaje para CSS
        speed: z.velocidad,
        tipo: z.tipo || 'Zombie Normal'
      })))
      
      setOleadaInfo({
        actual: data.oleadaActual,
        total: data.oleadaTotal,
        zombisRestantes: data.zombisRestantesOleada,
        enDescanso: data.descanso
      })

      // Activar modo nocturno en oleadas avanzadas (3+)
      setModoNocturno(data.oleadaActual >= 3)

      if (data.nombreNivel) {
        setNombreNivel(data.nombreNivel)
      }
    })

    newSocket.on('oleada-iniciada', (data) => {
      console.log(`Oleada ${data.numeroOleada} iniciada`)
      setFeedback('wave-started')
      setTimeout(() => setFeedback(null), 3000)
    })

    newSocket.on('oleada-completada', (data) => {
      console.log(`Oleada ${data.numeroOleada} completada`, data)
      
      // Actualizar comodines si se recibieron
      if (data.comodines) {
        setGameState(prev => ({
          ...prev,
          comodines: data.comodines
        }))
      }
      
      // Mostrar feedback con el regalo recibido
      if (data.regalo) {
        setFeedback(`wave-completed-${data.regalo}`)
      } else {
        setFeedback('wave-completed')
      }
      
      setTimeout(() => setFeedback(null), 3000)
    })

    newSocket.on('game-over', (data) => {
      console.log('Game Over:', data)
      setGameStatus('lost')
      if (data.preguntasIncorrectas) {
        setPreguntasIncorrectas(data.preguntasIncorrectas)
      }
      
      // Redirigir al dashboard después de 5 segundos
      setTimeout(() => {
        navigate('/dashboard')
      }, 5000)
    })

    newSocket.on('nivel-completado', (data) => {
      console.log('Nivel completado:', data)
      setGameStatus('won')
      if (data.preguntasIncorrectas) {
        setPreguntasIncorrectas(data.preguntasIncorrectas)
      }
      
      // Redirigir al dashboard después de 5 segundos
      setTimeout(() => {
        navigate('/dashboard')
      }, 5000)
    })

    newSocket.on('juego-limpio', (data) => {
      console.log('¡Bomba activada!', data)
      setFeedback('bomb-used')
      setTimeout(() => setFeedback(null), 2000)
      // Los zombis se actualizarán automáticamente con 'zombis-actualizados'
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

  const iniciarNivel = (nivelSeleccionado = nivel) => {
    if (socket) {
      socket.emit('iniciar-nivel', nivelSeleccionado)
      setGameStatus('playing')
      setZombies([])
      setMostrarSeleccionNivel(false)
    }
  }

  const seleccionarNivel = (nivelInfo) => {
    setNivel(nivelInfo.id)
    setNombreNivel(nivelInfo.nombre)
    setOleadaInfo(prev => ({ ...prev, total: nivelInfo.oleadas }))
  }

  // Ya no necesitamos mover zombis manualmente - el backend los maneja

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

  const togglePausa = () => {
    const nuevoPausado = !juegoPausado
    setJuegoPausado(nuevoPausado)
    if (socket) {
      socket.emit('pausar-juego', nuevoPausado)
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
          className={`bg-gradient-to-b from-orange-900/40 to-orange-800/40 rounded-xl p-4 shadow-2xl transition-all duration-300 ${
            casaBajoAtaque ? 'animate-pulse' : ''
          }`}
          style={{ 
            border: '8px solid #8B6914',
            boxShadow: '0 0 30px rgba(139, 105, 20, 0.5), inset 0 0 20px rgba(0,0,0,0.3)',
            animation: casaBajoAtaque ? 'shake 0.5s ease-in-out' : 'none'
          }}
        >
          {gameStatus === 'waiting' || gameStatus === 'connected' ? (
            <div className="flex items-center justify-center" style={{ minHeight: '500px' }}>
              {mostrarSeleccionNivel ? (
                <div className="text-center max-w-4xl">
                  <h2 className="text-pixel text-3xl text-white mb-8">
                    SELECCIONA TU NIVEL
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {nivelesDisponibles.map((nivelInfo) => (
                      <div
                        key={nivelInfo.id}
                        onClick={() => seleccionarNivel(nivelInfo)}
                        className={`card-pixel p-6 cursor-pointer transition-all hover:scale-105 ${
                          nivel === nivelInfo.id ? 'ring-4 ring-yellow-400 bg-yellow-900/20' : ''
                        }`}
                      >
                        <h3 className="text-pixel text-2xl text-yellow-400 mb-2">
                          {nivelInfo.nombre}
                        </h3>
                        <p className="text-game text-lg text-white mb-2">
                          {nivelInfo.oleadas} Oleadas
                        </p>
                        <p className="text-game text-sm text-gray-300">
                          {nivelInfo.descripcion}
                        </p>
                        {nivel === nivelInfo.id && (
                          <div className="mt-4">
                            <span className="text-pixel text-sm text-green-400">✓ SELECCIONADO</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => iniciarNivel(nivel)} 
                    className="btn-pixel-success text-xl px-8 py-4"
                  >
                    INICIAR {nombreNivel.toUpperCase()}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="text-pixel text-3xl text-white mb-6">
                    ¿LISTO PARA JUGAR?
                  </h2>
                  <button onClick={() => iniciarNivel(nivel)} className="btn-pixel-success text-xl px-8 py-4">
                    INICIAR {nombreNivel.toUpperCase()}
                  </button>
                </div>
              )}
            </div>
          ) : gameStatus === 'playing' ? (
            <>
              {/* Header del juego - Nivel, Vidas, Puntuación, Progreso */}
              <div className="bg-slate-900/80 border-4 border-slate-700 rounded-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
                {/* Nivel */}
                <div className="flex items-center gap-2">
                  <span className="text-game text-lg text-white">Nivel: <span className="text-yellow-400 font-bold">{nombreNivel}</span></span>
                </div>

                {/* Vidas con colores dinámicos */}
                <div className="flex items-center gap-2">
                  <span className="text-game text-lg text-white">
                    Vidas: <span className={`font-bold ${
                      gameState.vidas >= 4 ? 'text-green-400' :
                      gameState.vidas >= 2 ? 'text-yellow-400' :
                      'text-red-400 animate-pulse'
                    }`}>{gameState.vidas}</span>
                  </span>
                  <div className="flex gap-1">
                    {[...Array(gameState.vidas)].map((_, i) => (
                      <Heart 
                        key={i} 
                        className={`${
                          gameState.vidas >= 4 ? 'text-green-500 fill-green-500' :
                          gameState.vidas >= 2 ? 'text-yellow-500 fill-yellow-500' :
                          'text-red-500 fill-red-500 animate-pulse'
                        }`} 
                        size={20} 
                      />
                    ))}
                  </div>
                </div>

                {/* Puntuación */}
                <div className="flex items-center gap-2">
                  <span className="text-game text-lg text-white">Puntuación: <span className="text-green-400 font-bold">{gameState.puntuacion}</span></span>
                </div>

                {/* Oleada actual - Estilo PvZ */}
                <div className="flex items-center gap-2">
                  <span className="text-game text-lg text-white">
                    🌊 Oleada: <span className="text-purple-400 font-bold">{oleadaInfo.actual}/{oleadaInfo.total}</span>
                  </span>
                  {oleadaInfo.enDescanso && (
                    <span className="text-game text-sm text-green-400 animate-pulse bg-green-900/30 px-2 py-1 rounded">
                      ⏳ Preparándose...
                    </span>
                  )}
                </div>

                {/* Zombis activos - Estilo PvZ */}
                <div className="flex items-center gap-2">
                  <span className="text-game text-lg text-white">
                    🧟 Activos: <span className="text-red-400 font-bold">{zombies.length}</span>
                    {oleadaInfo.zombisRestantes > 0 && (
                      <span className="text-orange-400"> | Pendientes: {oleadaInfo.zombisRestantes}</span>
                    )}
                  </span>
                  {/* Barra de progreso de oleada */}
                  <div className="w-20 h-2 bg-gray-700 rounded-full border border-gray-500">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(10, (zombies.length / 15) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Progreso de aciertos */}
                <div className="flex items-center gap-2">
                  <span className="text-game text-lg text-white">
                    Eliminados: <span className="text-green-400 font-bold">{gameState.aciertos}</span>
                  </span>
                  {/* Contador para comodín gratis */}
                  <div className="text-game text-sm text-cyan-400">
                    ({gameState.aciertos % 10}/10 → 🎁)
                  </div>
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
                    title="Bomba: Elimina 3 zombis cercanos"
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
                    onClick={togglePausa}
                    className="px-3 py-2 rounded border-2 bg-yellow-600 border-yellow-800 hover:bg-yellow-700 text-white flex items-center gap-1 text-sm cursor-pointer"
                    title={juegoPausado ? "Reanudar juego" : "Pausar juego"}
                  >
                    {juegoPausado ? <Play size={16} /> : <Pause size={16} />}
                  </button>
                </div>
              </div>

              {/* Campo de batalla - Estilo Plants vs Zombies */}
              <div 
                className={`relative border-4 border-slate-700 rounded-lg overflow-hidden transition-all duration-1000 ${
                  modoNocturno 
                    ? 'bg-gradient-to-b from-indigo-900 via-purple-900 to-green-800' 
                    : 'bg-gradient-to-b from-sky-400 to-green-600'
                }`} 
                style={{ height: '350px' }}
              >
                {/* Sol/Luna decorativo animado */}
                <div 
                  className={`absolute top-4 right-8 text-6xl transition-all duration-1000 ${
                    modoNocturno ? 'animate-pulse' : 'animate-spin'
                  }`}
                  style={{ 
                    animationDuration: modoNocturno ? '3s' : '20s',
                    filter: modoNocturno 
                      ? 'drop-shadow(0 0 15px rgba(200, 200, 255, 0.8))' 
                      : 'drop-shadow(0 0 10px rgba(255, 255, 0, 0.5))'
                  }}
                >
                  {modoNocturno ? '🌙' : '☀️'}
                </div>

                {/* Estrellas en modo nocturno */}
                {modoNocturno && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={`star-${i}`}
                        className="absolute text-white animate-pulse"
                        style={{
                          left: `${10 + Math.random() * 80}%`,
                          top: `${5 + Math.random() * 40}%`,
                          animationDelay: `${Math.random() * 3}s`,
                          animationDuration: `${2 + Math.random() * 2}s`
                        }}
                      >
                        ⭐
                      </div>
                    ))}
                  </div>
                )}

                {/* Suelo/Césped con líneas como PvZ */}
                <div className={`absolute bottom-0 left-0 right-0 h-32 border-t-4 transition-all duration-1000 ${
                  modoNocturno 
                    ? 'bg-gradient-to-b from-green-900 to-green-950 border-green-950' 
                    : 'bg-gradient-to-b from-green-700 to-green-800 border-green-900'
                }`}>
                  {/* Sendero de zombis */}
                  <div className="absolute bottom-8 left-0 right-0 h-16 bg-gradient-to-r from-yellow-800/20 via-yellow-700/30 to-yellow-800/20 border-y border-yellow-600/40"></div>
                  
                  {/* Líneas del césped */}
                  <div className="absolute inset-0">
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i}
                        className="absolute w-full border-t border-green-600 opacity-20"
                        style={{ top: `${(i + 1) * 25}%` }}
                      ></div>
                    ))}
                  </div>

                  {/* Flores decorativas mejoradas - Distribución simétrica */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Flores arriba del sendero - Mejor espaciado */}
                    <div className="absolute" style={{ left: '20%', top: '15%' }}>
                      <div className="relative">
                        <div className="absolute w-2 h-2 bg-pink-400 rounded-full transform -translate-x-1 -translate-y-1 animate-pulse"></div>
                        <div className="absolute w-2 h-2 bg-pink-300 rounded-full transform translate-x-1 -translate-y-1 animate-pulse"></div>
                        <div className="absolute w-2 h-2 bg-pink-300 rounded-full transform -translate-x-1 translate-y-1 animate-pulse"></div>
                        <div className="absolute w-2 h-2 bg-pink-400 rounded-full transform translate-x-1 translate-y-1 animate-pulse"></div>
                        <div className="absolute w-1 h-1 bg-yellow-300 rounded-full transform translate-x-0.5 translate-y-0.5"></div>
                        <div className="absolute w-0.5 h-3 bg-green-600 transform translate-x-1 translate-y-2"></div>
                      </div>
                    </div>
                    
                    <div className="absolute" style={{ left: '40%', top: '10%' }}>
                      <div className="relative">
                        <div className="absolute w-2 h-2 bg-yellow-400 rounded-full transform -translate-x-1 -translate-y-1 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute w-2 h-2 bg-yellow-300 rounded-full transform translate-x-1 -translate-y-1 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute w-2 h-2 bg-yellow-300 rounded-full transform -translate-x-1 translate-y-1 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute w-2 h-2 bg-yellow-400 rounded-full transform translate-x-1 translate-y-1 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute w-1 h-1 bg-orange-300 rounded-full transform translate-x-0.5 translate-y-0.5"></div>
                        <div className="absolute w-0.5 h-3 bg-green-600 transform translate-x-1 translate-y-2"></div>
                      </div>
                    </div>
                    
                    <div className="absolute" style={{ left: '60%', top: '15%' }}>
                      <div className="relative">
                        <div className="absolute w-2 h-2 bg-purple-400 rounded-full transform -translate-x-1 -translate-y-1 animate-pulse" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute w-2 h-2 bg-purple-300 rounded-full transform translate-x-1 -translate-y-1 animate-pulse" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute w-2 h-2 bg-purple-300 rounded-full transform -translate-x-1 translate-y-1 animate-pulse" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute w-2 h-2 bg-purple-400 rounded-full transform translate-x-1 translate-y-1 animate-pulse" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute w-1 h-1 bg-white rounded-full transform translate-x-0.5 translate-y-0.5"></div>
                        <div className="absolute w-0.5 h-3 bg-green-600 transform translate-x-1 translate-y-2"></div>
                      </div>
                    </div>
                    
                    {/* Flores abajo del sendero - Posición más alta para evitar corte */}
                    <div className="absolute" style={{ left: '20%', bottom: '25%' }}>
                      <div className="relative">
                        <div className="absolute w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1 -translate-y-1 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        <div className="absolute w-2 h-2 bg-blue-300 rounded-full transform translate-x-1 -translate-y-1 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        <div className="absolute w-2 h-2 bg-blue-300 rounded-full transform -translate-x-1 translate-y-1 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        <div className="absolute w-2 h-2 bg-blue-400 rounded-full transform translate-x-1 translate-y-1 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        <div className="absolute w-1 h-1 bg-white rounded-full transform translate-x-0.5 translate-y-0.5"></div>
                        <div className="absolute w-0.5 h-3 bg-green-600 transform translate-x-1 translate-y-2"></div>
                      </div>
                    </div>
                    
                    <div className="absolute" style={{ left: '40%', bottom: '30%' }}>
                      <div className="relative">
                        <div className="absolute w-2 h-2 bg-orange-400 rounded-full transform -translate-x-1 -translate-y-1 animate-pulse" style={{ animationDelay: '2s' }}></div>
                        <div className="absolute w-2 h-2 bg-orange-300 rounded-full transform translate-x-1 -translate-y-1 animate-pulse" style={{ animationDelay: '2s' }}></div>
                        <div className="absolute w-2 h-2 bg-orange-300 rounded-full transform -translate-x-1 translate-y-1 animate-pulse" style={{ animationDelay: '2s' }}></div>
                        <div className="absolute w-2 h-2 bg-orange-400 rounded-full transform translate-x-1 translate-y-1 animate-pulse" style={{ animationDelay: '2s' }}></div>
                        <div className="absolute w-1 h-1 bg-red-300 rounded-full transform translate-x-0.5 translate-y-0.5"></div>
                        <div className="absolute w-0.5 h-3 bg-green-600 transform translate-x-1 translate-y-2"></div>
                      </div>
                    </div>
                    
                    <div className="absolute" style={{ left: '60%', bottom: '25%' }}>
                      <div className="relative">
                        <div className="absolute w-2 h-2 bg-red-400 rounded-full transform -translate-x-1 -translate-y-1 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        <div className="absolute w-2 h-2 bg-red-300 rounded-full transform translate-x-1 -translate-y-1 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        <div className="absolute w-2 h-2 bg-red-300 rounded-full transform -translate-x-1 translate-y-1 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        <div className="absolute w-2 h-2 bg-red-400 rounded-full transform translate-x-1 translate-y-1 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                        <div className="absolute w-1 h-1 bg-yellow-200 rounded-full transform translate-x-0.5 translate-y-0.5"></div>
                        <div className="absolute w-0.5 h-3 bg-green-600 transform translate-x-1 translate-y-2"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Casa del jugador (IZQUIERDA como PvZ) */}
                <div className="absolute left-4 bottom-4 z-10">
                  <HouseBase 
                    playerName={localStorage.getItem('username') || 'JUGADOR'}
                    isUnderAttack={casaBajoAtaque}
                  />
                </div>

                {/* Zombis - VIENEN DE LA DERECHA hacia la base (izquierda) como PvZ */}
                {zombies.map((zombie, index) => (
                  <div
                    key={zombie.id}
                    className="absolute bottom-12 transition-all duration-700 ease-linear z-20"
                    style={{ 
                      right: `${Math.min(zombie.position, 85)}%`, // CAMBIO: right en lugar de left
                      transform: 'translateX(50%)', // CAMBIO: 50% en lugar de -50%
                      filter: tiempoCongelado ? 'brightness(0.5) saturate(0.5) hue-rotate(180deg)' : 'none',
                      opacity: zombie.position < 5 ? zombie.position / 5 : 1, // Fade in natural
                      zIndex: 20 + index // Zombis más nuevos aparecen encima
                    }}
                  >
                    <ZombieCharacter 
                      equation={zombie.derivada} 
                      position={zombie.position}
                      isMoving={!tiempoCongelado}
                      tipo={zombie.tipo}
                    />
                    {/* Barra de progreso del zombi */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-700 rounded">
                      <div 
                        className={`h-full rounded transition-all duration-700 ${
                          zombie.position < 30 ? 'bg-green-500' :
                          zombie.position < 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(zombie.position, 100)}%` }}
                      ></div>
                    </div>
                    {/* Indicador de velocidad */}
                    {zombie.speed > 1 && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-red-400 text-xs animate-pulse">
                        ⚡ x{zombie.speed}
                      </div>
                    )}
                  </div>
                ))}

                {/* Indicador de juego pausado */}
                {juegoPausado && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40">
                    <div className="text-center">
                      <div className="text-pixel text-6xl text-white mb-4 animate-pulse">
                        ⏸️ PAUSADO
                      </div>
                      <button
                        onClick={togglePausa}
                        className="btn-pixel-success text-xl px-8 py-4"
                      >
                        ▶️ CONTINUAR
                      </button>
                    </div>
                  </div>
                )}

                {/* Indicador de tiempo congelado */}
                {tiempoCongelado && !juegoPausado && (
                  <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center z-30">
                    <div className="text-pixel text-4xl text-white animate-pulse">
                      ❄️ CONGELADO ❄️
                    </div>
                    {/* Efectos de nieve */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute text-white text-2xl animate-bounce"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${1 + Math.random()}s`
                          }}
                        >
                          ❄️
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Efectos especiales para feedback */}
                {feedback === 'bomb-used' && (
                  <div className="absolute inset-0 bg-orange-500/50 flex items-center justify-center z-30">
                    <div className="text-pixel text-4xl text-white animate-pulse">
                      💥 3 ZOMBIS ELIMINADOS! 💥
                    </div>
                    
                    {/* Partículas de explosión */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(15)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-orange-400 rounded-full animate-ping"
                          style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                            animationDelay: `${Math.random() * 0.5}s`,
                            animationDuration: `${0.5 + Math.random() * 0.5}s`
                          }}
                        ></div>
                      ))}
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={`spark-${i}`}
                          className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-bounce"
                          style={{
                            left: `${30 + Math.random() * 40}%`,
                            top: `${30 + Math.random() * 40}%`,
                            animationDelay: `${Math.random() * 0.3}s`,
                            animationDuration: `${0.3 + Math.random() * 0.4}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}

                {feedback === 'zombie-arrived' && (
                  <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center z-30">
                    <div className="text-pixel text-4xl text-white animate-pulse shake-animation">
                      💀 ¡ATAQUE! 💀
                    </div>
                  </div>
                )}

                {feedback === 'wave-started' && (
                  <div className="absolute inset-0 bg-purple-500/40 flex items-center justify-center z-30">
                    <div className="text-pixel text-5xl text-white animate-bounce">
                      🌊 OLEADA {oleadaInfo.actual} 🌊
                    </div>
                  </div>
                )}

                {(feedback === 'wave-completed' || feedback?.startsWith('wave-completed-')) && (
                  <div className="absolute inset-0 bg-blue-500/40 flex items-center justify-center z-30 flex-col">
                    <div className="text-pixel text-4xl text-white animate-pulse mb-4">
                      ✅ ¡OLEADA COMPLETADA! ✅
                    </div>
                    {feedback?.startsWith('wave-completed-') && (
                      <div className="text-pixel text-3xl text-yellow-300 animate-bounce">
                        🎁 Regalo: {feedback.includes('bomba') ? '💣 BOMBA' : '❄️ COPO DE NIEVE'} 🎁
                      </div>
                    )}
                  </div>
                )}

                {feedback === 'free-powerup' && (
                  <div className="absolute inset-0 bg-cyan-500/50 flex items-center justify-center z-30">
                    <div className="text-pixel text-4xl text-white animate-bounce">
                      🎁 ¡COMODÍN GRATIS! 🎁
                    </div>
                    
                    {/* Partículas de regalo */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={`gift-${i}`}
                          className="absolute text-2xl animate-ping"
                          style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                            animationDelay: `${Math.random() * 0.5}s`,
                            animationDuration: `${0.8 + Math.random() * 0.4}s`
                          }}
                        >
                          {['🎁', '⭐', '✨', '💎'][Math.floor(Math.random() * 4)]}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Panel de pregunta y respuestas */}
              <div className="mt-4">
                {preguntaActual ? (
                  <div className="bg-slate-900/90 border-4 border-slate-700 rounded-lg p-4">
                    {/* Feedback visual mejorado */}
                    {feedback && (
                      <div className={`text-center text-pixel text-2xl mb-3 animate-pulse ${
                        feedback === 'correct' ? 'text-green-400' : 
                        feedback === 'incorrect' ? 'text-yellow-400' :
                        feedback === 'zombie-arrived' ? 'text-red-400' :
                        feedback === 'bomb-used' ? 'text-orange-400' :
                        feedback === 'wave-started' ? 'text-purple-400' :
                        (feedback === 'wave-completed' || feedback?.startsWith('wave-completed-')) ? 'text-blue-400' :
                        feedback === 'free-powerup' ? 'text-cyan-400' : 'text-white'
                      }`}>
                        {feedback === 'correct' && '🎯 ¡ZOMBI ELIMINADO! ✓'}
                        {feedback === 'incorrect' && '❌ ¡SIGUE INTENTANDO!'}
                        {feedback === 'zombie-arrived' && '💀 ¡ZOMBI LLEGÓ A LA BASE!'}
                        {feedback === 'bomb-used' && '💣 ¡3 ZOMBIS ELIMINADOS!'}
                        {feedback === 'wave-started' && (
                  oleadaInfo.actual >= 3 
                    ? `🌙 ¡OLEADA NOCTURNA ${oleadaInfo.actual}!` 
                    : `🌊 ¡OLEADA ${oleadaInfo.actual} INICIADA!`
                )}
                        {(feedback === 'wave-completed' || feedback?.startsWith('wave-completed-')) && (
                          <>
                            {`✅ ¡OLEADA ${oleadaInfo.actual - 1} COMPLETADA!`}
                            {feedback?.startsWith('wave-completed-') && (
                              <span className="text-yellow-300"> 🎁 +{feedback.includes('bomba') ? '💣' : '❄️'}</span>
                            )}
                          </>
                        )}
                        {feedback === 'free-powerup' && `🎁 ¡COMODÍN GRATIS! (${gameState.aciertos} eliminados)`}
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
                      {preguntaActual.opciones && preguntaActual.opciones.map((opcion, index) => (
                        <button
                          key={index}
                          onClick={() => enviarRespuesta(opcion)}
                          disabled={selectedAnswer !== null}
                          className={`p-3 md:p-4 text-game border-3 rounded-lg transition-all ${
                            selectedAnswer === opcion
                              ? 'bg-blue-600 border-blue-400 scale-105'
                              : 'bg-slate-700/80 border-slate-500 hover:bg-slate-600'
                          } ${selectedAnswer !== null ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
                        >
                          <div className="text-white text-base md:text-lg font-bold text-center">{opcion}</div>
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
              <div className="text-center bg-green-900/50 border-4 border-green-500 rounded-xl p-8 max-w-4xl">
                <div className="text-7xl mb-4">🏆</div>
                <h2 className="text-pixel text-4xl text-green-400 mb-6 animate-bounce">
                  ¡VICTORIA ÉPICA!
                </h2>
                <p className="text-game text-2xl text-white mb-4">
                  🧠 ¡Salvaste tus sesos de los zombis!
                </p>
                <p className="text-game text-lg text-green-300 mb-4">
                  Completaste todas las oleadas del nivel {nombreNivel}
                </p>
                <p className="text-game text-2xl text-yellow-300 mb-8">
                  Puntuación Final: <span className="font-bold">{gameState.puntuacion}</span>
                </p>

                {/* Mensaje de redirección automática */}
                <div className="bg-blue-900/50 border-2 border-blue-400 rounded-lg p-4 mb-6 animate-pulse">
                  <p className="text-game text-xl text-blue-300">
                    ⏱️ Regresando al menú en 5 segundos...
                  </p>
                </div>

                {/* Mostrar preguntas incorrectas si existen */}
                {preguntasIncorrectas && preguntasIncorrectas.length > 0 && (
                  <div className="bg-black/50 border-2 border-yellow-400 rounded-lg p-6 mb-8 max-h-96 overflow-y-auto">
                    <h3 className="text-pixel text-2xl text-yellow-300 mb-4">
                      📚 REPASO DE ERRORES
                    </h3>
                    <p className="text-game text-sm text-gray-300 mb-4">
                      Aunque ganaste, revisa estos errores para mejorar:
                    </p>
                    <div className="space-y-4">
                      {preguntasIncorrectas.map((pregunta, index) => (
                        <div key={index} className="bg-slate-800/70 border border-yellow-500/50 rounded-lg p-4 text-left">
                          <div className="text-game text-lg text-white mb-2">
                            <span className="text-yellow-400 font-bold">#{index + 1}</span> {pregunta.enunciado}
                          </div>
                          <div className="text-game text-sm text-red-300 mb-1">
                            ❌ Tu respuesta: <span className="font-bold">{pregunta.respuestaUsuario}</span>
                          </div>
                          <div className="text-game text-sm text-green-400">
                            ✓ Correcta: <span className="font-bold">{pregunta.respuestaCorrecta}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={salir} className="btn-pixel-success text-xl px-8 py-4">
                  VOLVER AL MENÚ
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center" style={{ minHeight: '500px' }}>
              <div className="text-center bg-red-900/50 border-4 border-red-500 rounded-xl p-8 max-w-4xl">
                <div className="text-7xl mb-4">☠️</div>
                <h2 className="text-pixel text-4xl text-red-400 mb-6 shake-animation">
                  GAME OVER
                </h2>
                <p className="text-game text-2xl text-white mb-4">
                  🧠 ¡Los zombis se comieron tus sesos!
                </p>
                <p className="text-game text-2xl text-yellow-300 mb-8">
                  Puntuación Final: <span className="font-bold">{gameState.puntuacion}</span>
                </p>

                {/* Mensaje de redirección automática */}
                <div className="bg-blue-900/50 border-2 border-blue-400 rounded-lg p-4 mb-6 animate-pulse">
                  <p className="text-game text-xl text-blue-300">
                    ⏱️ Regresando al menú en 5 segundos...
                  </p>
                </div>

                {/* Mostrar preguntas incorrectas si existen */}
                {preguntasIncorrectas && preguntasIncorrectas.length > 0 && (
                  <div className="bg-black/50 border-2 border-red-400 rounded-lg p-6 mb-8 max-h-96 overflow-y-auto">
                    <h3 className="text-pixel text-2xl text-red-300 mb-4">
                      📚 REPASO DE ERRORES
                    </h3>
                    <p className="text-game text-sm text-gray-300 mb-4">
                      Revisa estas preguntas para mejorar:
                    </p>
                    <div className="space-y-4">
                      {preguntasIncorrectas.map((pregunta, index) => (
                        <div key={index} className="bg-slate-800/70 border border-red-500/50 rounded-lg p-4 text-left">
                          <div className="text-game text-lg text-white mb-2">
                            <span className="text-red-400 font-bold">#{index + 1}</span> {pregunta.enunciado}
                          </div>
                          <div className="text-game text-sm text-red-300 mb-1">
                            ❌ Tu respuesta: <span className="font-bold">{pregunta.respuestaUsuario}</span>
                          </div>
                          <div className="text-game text-sm text-green-400">
                            ✓ Correcta: <span className="font-bold">{pregunta.respuestaCorrecta}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
