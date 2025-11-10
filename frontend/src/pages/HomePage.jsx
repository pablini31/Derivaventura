import { Link } from 'react-router-dom'
import { Bomb, Trophy, Calendar, Play, UserPlus, LogIn } from 'lucide-react'
import AudioManager from '../components/AudioManager'
import { playClickSound, useSettings } from '../hooks/useSettings'

function HomePage() {
  const { settings } = useSettings()
  
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
      
      <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Logo y título principal */}
        <div className="text-center mb-12 float-animation">
          <div className="inline-block mb-6">
            <Bomb className="w-24 h-24 text-purple-500 mx-auto glow-animation" strokeWidth={2.5} />
          </div>
          <h1 
            className="text-pixel text-5xl md:text-7xl mb-4" 
            style={{ 
              color: '#FFD700',
              textShadow: '4px 4px 0px #000, 6px 6px 0px rgba(0,0,0,0.5)',
              fontWeight: 'bold',
              letterSpacing: '2px'
            }}
          >
            DERIVAVENTURA
          </h1>
          <p className="text-game text-2xl md:text-3xl text-yellow-200" style={{ textShadow: '2px 2px 0px #000' }}>
            ¡Aprende derivadas defendiendo tu casa!
          </p>
        </div>

        {/* Tarjeta principal */}
        <div className="card-pixel mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sección de autenticación */}
            <div className="space-y-4">
              <h2 className="text-pixel text-xl text-purple-300 mb-4">
                COMENZAR
              </h2>
              
              <Link to="/login" className="block" onClick={playClickSound}>
                <button className="btn-pixel w-full flex items-center justify-center gap-3">
                  <LogIn size={20} />
                  <span>Iniciar Sesión</span>
                </button>
              </Link>
              
              <Link to="/register" className="block" onClick={playClickSound}>
                <button className="btn-pixel-success w-full flex items-center justify-center gap-3">
                  <UserPlus size={20} />
                  <span>Registrarse</span>
                </button>
              </Link>
            </div>

            {/* Sección de información */}
            <div className="space-y-4">
              <h2 className="text-pixel text-xl text-purple-300 mb-4">
                CARACTERÍSTICAS
              </h2>
              
              <div className="space-y-3 text-game text-xl">
                <div className="flex items-center gap-3 text-white">
                  <Play className="text-green-400" size={24} />
                  <span>Juego en tiempo real</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Trophy className="text-yellow-400" size={24} />
                  <span>Sistema de ranking</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Calendar className="text-blue-400" size={24} />
                  <span>Desafíos diarios</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Bomb className="text-red-400" size={24} />
                  <span>Comodines especiales</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de navegación adicionales */}
        <div className="flex justify-center">
          <Link to="/ranking" className="block w-full md:w-1/2" onClick={playClickSound}>
            <button className="btn-pixel w-full flex items-center justify-center gap-3">
              <Trophy size={20} />
              <span>Ver Ranking</span>
            </button>
          </Link>
        </div>

        {/* Instrucciones del juego */}
        <div className="card-pixel mt-8">
          <h3 className="text-pixel text-lg text-purple-300 mb-4">
            ¿CÓMO JUGAR?
          </h3>
          <div className="text-game text-xl text-white space-y-2">
            <p>🧟 Los zombis avanzan desde la derecha con derivadas</p>
            <p>🎯 Resuelve correctamente para eliminarlos antes de que lleguen</p>
            <p>💣 Bomba: elimina los 3 zombis más cercanos</p>
            <p>❄️ Copo: congela el tiempo por unos segundos</p>
            <p>🌊 Sobrevive a todas las oleadas para ganar</p>
            <p>🏠 Defiende tu casa - ¡Solo pierdes vida si llegan!</p>
            <p>📅 Desafío diario: Gana 1 vida extra</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-game text-lg text-purple-400">
          <p>Desarrollado con ❤️ para aprender matemáticas</p>
        </div>
      </div>
    </div>
    </>
  )
}

export default HomePage
