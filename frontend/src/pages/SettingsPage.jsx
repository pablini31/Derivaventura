import { Link } from 'react-router-dom'
import { ArrowLeft, Volume2, VolumeX, Music, Eye, RotateCcw } from 'lucide-react'
import { useSettings, playClickSound } from '../hooks/useSettings'
import AudioManager from '../components/AudioManager'

function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings()

  const handleSliderChange = (category, key, value) => {
    updateSettings(category, key, parseFloat(value))
  }

  const handleToggle = (category, key) => {
    playClickSound()
    updateSettings(category, key, !settings[category][key])
  }

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres restablecer todas las configuraciones?')) {
      playClickSound()
      resetSettings()
    }
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
          <Link 
            to="/dashboard" 
            onClick={playClickSound}
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 text-game text-xl"
          >
            <ArrowLeft size={20} />
            <span>Volver al menú</span>
          </Link>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-pixel text-4xl text-white mb-2">
              ⚙️ CONFIGURACIÓN
            </h1>
            <p className="text-game text-lg text-purple-300">
              Personaliza tu experiencia de juego
            </p>
          </div>

          {/* Secciones de configuración */}
          <div className="space-y-6">
            
            {/* AUDIO */}
            <div className="card-pixel">
              <div className="flex items-center gap-3 mb-6">
                <Volume2 className="text-purple-500" size={32} />
                <h2 className="text-pixel text-2xl text-white">AUDIO</h2>
              </div>

              {/* Volumen Master */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-game text-lg text-purple-300">
                    Volumen General
                  </label>
                  <span className="text-game text-lg text-white">
                    {Math.round(settings.audio.masterVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.audio.masterVolume}
                  onChange={(e) => handleSliderChange('audio', 'masterVolume', e.target.value)}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Volumen Música */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-game text-lg text-purple-300 flex items-center gap-2">
                    <Music size={18} />
                    Volumen Música
                  </label>
                  <span className="text-game text-lg text-white">
                    {Math.round(settings.audio.musicVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.audio.musicVolume}
                  onChange={(e) => handleSliderChange('audio', 'musicVolume', e.target.value)}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  disabled={!settings.audio.musicEnabled}
                />
              </div>

              {/* Volumen Efectos */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-game text-lg text-purple-300 flex items-center gap-2">
                    🔊 Volumen Efectos
                  </label>
                  <span className="text-game text-lg text-white">
                    {Math.round(settings.audio.sfxVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.audio.sfxVolume}
                  onChange={(e) => handleSliderChange('audio', 'sfxVolume', e.target.value)}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  disabled={!settings.audio.sfxEnabled}
                />
              </div>

              {/* Toggles de Audio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleToggle('audio', 'musicEnabled')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.audio.musicEnabled
                      ? 'bg-green-900/30 border-green-500 text-green-400'
                      : 'bg-red-900/30 border-red-500 text-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-game text-lg">Música</span>
                    {settings.audio.musicEnabled ? <Music size={20} /> : <VolumeX size={20} />}
                  </div>
                </button>

                <button
                  onClick={() => handleToggle('audio', 'sfxEnabled')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.audio.sfxEnabled
                      ? 'bg-green-900/30 border-green-500 text-green-400'
                      : 'bg-red-900/30 border-red-500 text-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-game text-lg">Efectos de Sonido</span>
                    {settings.audio.sfxEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </div>
                </button>
              </div>
            </div>

            {/* VISUALES */}
            <div className="card-pixel">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="text-purple-500" size={32} />
                <h2 className="text-pixel text-2xl text-white">VISUALES</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleToggle('display', 'animations')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.display.animations
                      ? 'bg-green-900/30 border-green-500 text-green-400'
                      : 'bg-gray-900/30 border-gray-500 text-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">✨</div>
                    <span className="text-game text-sm">Animaciones</span>
                  </div>
                </button>

                <button
                  onClick={() => handleToggle('display', 'particles')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.display.particles
                      ? 'bg-green-900/30 border-green-500 text-green-400'
                      : 'bg-gray-900/30 border-gray-500 text-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">💫</div>
                    <span className="text-game text-sm">Partículas</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Botón de Reset */}
            <div className="card-pixel bg-red-900/20 border-red-500/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-pixel text-xl text-red-400 mb-2">
                    Restablecer Configuración
                  </h3>
                  <p className="text-game text-sm text-gray-400">
                    Volver a los valores predeterminados
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="btn-pixel bg-red-600 hover:bg-red-700 border-red-800 flex items-center gap-2"
                >
                  <RotateCcw size={18} />
                  <span>RESET</span>
                </button>
              </div>
            </div>

          </div>

          {/* Información adicional */}
          <div className="mt-8 text-center">
            <p className="text-game text-sm text-gray-500">
              Los cambios se guardan automáticamente
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsPage
