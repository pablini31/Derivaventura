import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, ArrowLeft, Medal, Loader } from 'lucide-react'
import axios from 'axios'
import AudioManager from '../components/AudioManager'
import { playClickSound, useSettings } from '../hooks/useSettings'

function RankingPage() {
  const { settings } = useSettings()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRanking()
  }, [])

  const fetchRanking = async () => {
    try {
      const response = await axios.get('/api/ranking')
      setRanking(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error al obtener ranking:', err)
      setError('Error al cargar el ranking')
      setLoading(false)
    }
  }

  const getMedalColor = (index) => {
    if (index === 0) return 'text-yellow-400'
    if (index === 1) return 'text-gray-300'
    if (index === 2) return 'text-orange-600'
    return 'text-purple-400'
  }

  const getMedalIcon = (index) => {
    if (index < 3) return <Medal className={getMedalColor(index)} size={32} />
    return <span className="text-game text-2xl text-purple-400">#{index + 1}</span>
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
        <div className="max-w-4xl mx-auto">
        {/* Botón de regreso */}
        <Link to="/dashboard" onClick={playClickSound} className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 text-game text-xl">
          <ArrowLeft size={20} />
          <span>Volver al menú</span>
        </Link>

        {/* Título */}
        <div className="text-center mb-8">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 glow-animation" strokeWidth={2.5} />
          <h1 className="text-pixel text-4xl text-white mb-2">
            RANKING GLOBAL
          </h1>
          <p className="text-game text-2xl text-purple-300">
            Top 10 Mejores Jugadores (Puntuación Total)
          </p>
        </div>

        {/* Tabla de ranking */}
        <div className="card-pixel">
          {loading ? (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
              <p className="text-game text-xl text-purple-300">Cargando ranking...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-game text-xl text-red-400">{error}</p>
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-game text-xl text-purple-300">
                No hay partidas registradas aún
              </p>
              <p className="text-game text-lg text-gray-400 mt-4">
                ¡Sé el primero en jugar!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ranking.map((jugador, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    index < 3
                      ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500 glow-animation'
                      : 'bg-slate-800/50 border-purple-700/30'
                  }`}
                >
                  {/* Posición */}
                  <div className="flex-shrink-0 w-16 flex items-center justify-center">
                    {getMedalIcon(index)}
                  </div>

                  {/* Nombre del jugador */}
                  <div className="flex-1">
                    <p className={`text-game text-2xl ${
                      index < 3 ? 'text-white font-bold' : 'text-purple-200'
                    }`}>
                      {jugador.nombre_usuario}
                    </p>
                    <p className="text-game text-sm text-gray-400">
                      {new Date(jugador.fecha_partida).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Puntuación */}
                  <div className="flex-shrink-0">
                    <div className={`px-6 py-2 rounded-lg ${
                      index < 3
                        ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
                        : 'bg-purple-900/50'
                    }`}>
                      <p className="text-game text-2xl text-white font-bold">
                        {jugador.puntuacion_final} pts
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón para actualizar */}
        {!loading && (
          <div className="text-center mt-6">
            <button
              onClick={fetchRanking}
              className="btn-pixel"
            >
              ACTUALIZAR RANKING
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default RankingPage
