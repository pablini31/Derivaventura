import { Link, useNavigate } from 'react-router-dom'
import { Play, Calendar, Trophy, Settings, LogOut, User, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import AudioManager from '../components/AudioManager'
import { playClickSound, useSettings } from '../hooks/useSettings'

function DashboardPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const { settings } = useSettings()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUsername = localStorage.getItem('username')

    if (!token || !storedUsername) {
      navigate('/login')
      return
    }

    setUsername(storedUsername)
  }, [navigate])

  const handleLogout = () => {
    playClickSound()
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/')
  }

  return (
    <>
      {/* Música de fondo del menú */}
      {settings.audio.musicEnabled && (
        <AudioManager 
          track="/menu-music.mp3" 
          volume={settings.audio.musicVolume * settings.audio.masterVolume} 
          loop={true} 
        />
      )}
      
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="card-pixel mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <User className="w-12 h-12 text-purple-400" strokeWidth={2} />
              <div>
                <h1 className="text-pixel text-2xl text-white">
                  ¡BIENVENIDO, {username.toUpperCase()}!
                </h1>
                <p className="text-game text-lg text-purple-300">
                  Panel de Control
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-pixel-danger flex items-center gap-2">
              <LogOut size={20} />
              <span>Salir</span>
            </button>
          </div>
        </div>

        {/* Título */}
        <div className="text-center mb-8">
          <h2 
            className="text-pixel text-4xl md:text-5xl mb-2" 
            style={{ 
              color: '#FFD700',
              textShadow: '4px 4px 0px #000, 6px 6px 0px rgba(0,0,0,0.5)',
              fontWeight: 'bold'
            }}
          >
            DERIVAVENTURA
          </h2>
          <p className="text-game text-xl text-yellow-200" style={{ textShadow: '2px 2px 0px #000' }}>
            Selecciona una opción
          </p>
        </div>

        {/* Opciones principales */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Jugar */}
          <Link to="/game" onClick={playClickSound}>
            <div className="card-pixel hover:scale-105 transition-transform cursor-pointer h-full">
              <div className="text-center">
                <Play className="w-20 h-20 text-green-400 mx-auto mb-4 glow-animation" strokeWidth={2.5} />
                <h3 className="text-pixel text-2xl text-white mb-2">
                  JUGAR
                </h3>
                <p className="text-game text-lg text-purple-300">
                  Inicia una nueva partida
                </p>
              </div>
            </div>
          </Link>

          {/* Desafío Diario */}
          <Link to="/daily-challenge" onClick={playClickSound}>
            <div className="card-pixel hover:scale-105 transition-transform cursor-pointer h-full">
              <div className="text-center">
                <Calendar className="w-20 h-20 text-blue-400 mx-auto mb-4 glow-animation" strokeWidth={2.5} />
                <h3 className="text-pixel text-2xl text-white mb-2">
                  DESAFÍO DIARIO
                </h3>
                <p className="text-game text-lg text-purple-300">
                  Gana 1 vida extra
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Heart className="text-red-500" size={20} />
                  <span className="text-game text-sm text-green-400">+1 Vida</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Ranking */}
          <Link to="/ranking" onClick={playClickSound}>
            <div className="card-pixel hover:scale-105 transition-transform cursor-pointer h-full">
              <div className="text-center">
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 glow-animation" strokeWidth={2.5} />
                <h3 className="text-pixel text-2xl text-white mb-2">
                  RANKING
                </h3>
                <p className="text-game text-lg text-purple-300">
                  Mejores jugadores
                </p>
              </div>
            </div>
          </Link>

          {/* Configuración */}
          <Link to="/settings" onClick={playClickSound}>
            <div className="card-pixel hover:scale-105 transition-transform cursor-pointer h-full">
              <div className="text-center">
                <Settings className="w-20 h-20 text-purple-400 mx-auto mb-4 glow-animation" strokeWidth={2.5} />
                <h3 className="text-pixel text-2xl text-white mb-2">
                  CONFIGURACIÓN
                </h3>
                <p className="text-game text-lg text-purple-300">
                  Ajustes del juego
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Instrucciones */}
        <div className="card-pixel">
          <h3 className="text-pixel text-xl text-purple-300 mb-4">
            ¿CÓMO JUGAR?
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-game text-lg text-white">
            <div className="space-y-2">
              <p>🧟 Zombis avanzan con derivadas</p>
              <p>🎯 Resuelve para eliminarlos</p>
              <p>💣 Bomba: elimina 3 zombis cercanos</p>
            </div>
            <div className="space-y-2">
              <p>❄️ Copo: congela el tiempo</p>
              <p>🌊 Sobrevive a todas las oleadas</p>
              <p>🏠 Defiende tu casa</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default DashboardPage
