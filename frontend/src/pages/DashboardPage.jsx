import { Link, useNavigate } from 'react-router-dom'
import { Play, Calendar, Trophy, Settings, LogOut, User, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'

function DashboardPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')

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
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/')
  }

  return (
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
          <Link to="/game">
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
          <Link to="/daily-challenge">
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
          <Link to="/ranking">
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
          <div className="card-pixel opacity-50 cursor-not-allowed h-full">
            <div className="text-center">
              <Settings className="w-20 h-20 text-gray-400 mx-auto mb-4" strokeWidth={2.5} />
              <h3 className="text-pixel text-2xl text-gray-400 mb-2">
                CONFIGURACIÓN
              </h3>
              <p className="text-game text-lg text-gray-500">
                Próximamente
              </p>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="card-pixel">
          <h3 className="text-pixel text-xl text-purple-300 mb-4">
            ¿CÓMO JUGAR?
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-game text-lg text-white">
            <div className="space-y-2">
              <p>🧟 Los zombies avanzan con derivadas</p>
              <p>🎯 Resuelve correctamente para eliminarlos</p>
              <p>💣 Bomba: elimina todos los zombies</p>
            </div>
            <div className="space-y-2">
              <p>❄️ Copo: congela el tiempo</p>
              <p>⭐ Consigue 5 aciertos para ganar</p>
              <p>🏰 Defiende tu torre</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
