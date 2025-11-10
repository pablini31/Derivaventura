import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, ArrowLeft, Loader } from 'lucide-react'
import axios from 'axios'
import AudioManager from '../components/AudioManager'
import { playClickSound, useSettings } from '../hooks/useSettings'

function RegisterPage() {
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    correo: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post('/api/jugadores/registro', {
        nombre_usuario: formData.nombre_usuario,
        correo: formData.correo,
        password: formData.password
      })
      
      console.log('Registro exitoso:', response.data)
      setSuccess(true)
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      console.error('Error en registro:', err)
      setError(err.response?.data?.mensaje || 'Error al registrar usuario')
    } finally {
      setLoading(false)
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
      
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
        {/* Botón de regreso */}
        <Link to="/" onClick={playClickSound} className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 text-game text-xl">
          <ArrowLeft size={20} />
          <span>Volver al inicio</span>
        </Link>

        {/* Tarjeta de registro */}
        <div className="card-pixel">
          <div className="text-center mb-8">
            <UserPlus className="w-16 h-16 text-green-500 mx-auto mb-4 glow-animation" strokeWidth={2.5} />
            <h1 className="text-pixel text-3xl text-white mb-2">
              REGISTRARSE
            </h1>
            <p className="text-game text-xl text-purple-300">
              Crea tu cuenta nueva
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-900/50 border-2 border-red-500 p-4 rounded shake-animation">
                <p className="text-game text-lg text-red-200">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="bg-green-900/50 border-2 border-green-500 p-4 rounded">
                <p className="text-game text-lg text-green-200">
                  ¡Registro exitoso! Redirigiendo al login...
                </p>
              </div>
            )}

            {/* Usuario */}
            <div>
              <label className="block text-game text-xl text-purple-300 mb-2">
                USUARIO
              </label>
              <input
                type="text"
                name="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={handleChange}
                className="input-pixel"
                placeholder="Elige un nombre de usuario"
                required
                disabled={loading || success}
                minLength={3}
              />
            </div>

            {/* Correo */}
            <div>
              <label className="block text-game text-xl text-purple-300 mb-2">
                CORREO
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className="input-pixel"
                placeholder="tu@email.com"
                required
                disabled={loading || success}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-game text-xl text-purple-300 mb-2">
                CONTRASEÑA
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-pixel"
                placeholder="Mínimo 6 caracteres"
                required
                disabled={loading || success}
                minLength={6}
              />
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-game text-xl text-purple-300 mb-2">
                CONFIRMAR CONTRASEÑA
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-pixel"
                placeholder="Repite tu contraseña"
                required
                disabled={loading || success}
                minLength={6}
              />
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={loading || success}
              className={`w-full flex items-center justify-center gap-3 ${
                loading || success ? 'btn-pixel-disabled' : 'btn-pixel-success'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>REGISTRANDO...</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>CREAR CUENTA</span>
                </>
              )}
            </button>
          </form>

          {/* Link a login */}
          <div className="mt-6 text-center">
            <p className="text-game text-lg text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" onClick={playClickSound} className="text-purple-400 hover:text-purple-300 underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default RegisterPage
