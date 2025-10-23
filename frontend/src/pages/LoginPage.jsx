import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, ArrowLeft, Loader } from 'lucide-react'
import axios from 'axios'

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

    try {
      const response = await axios.post('/api/jugadores/login', formData)
      
      // Guardar token en localStorage
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('username', formData.nombre_usuario)
      
      console.log('Login exitoso:', response.data)
      
      // Redirigir al dashboard
      navigate('/dashboard')
    } catch (err) {
      console.error('Error en login:', err)
      setError(err.response?.data?.mensaje || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Botón de regreso */}
        <Link to="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 text-game text-xl">
          <ArrowLeft size={20} />
          <span>Volver al inicio</span>
        </Link>

        {/* Tarjeta de login */}
        <div className="card-pixel">
          <div className="text-center mb-8">
            <LogIn className="w-16 h-16 text-purple-500 mx-auto mb-4 glow-animation" strokeWidth={2.5} />
            <h1 className="text-pixel text-3xl text-white mb-2">
              INICIAR SESIÓN
            </h1>
            <p className="text-game text-xl text-purple-300">
              Ingresa tus credenciales
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
                placeholder="Ingresa tu usuario"
                required
                disabled={loading}
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
                placeholder="Ingresa tu contraseña"
                required
                disabled={loading}
              />
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-3 ${
                loading ? 'btn-pixel-disabled' : 'btn-pixel'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>CARGANDO...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>ENTRAR</span>
                </>
              )}
            </button>
          </form>

          {/* Link a registro */}
          <div className="mt-6 text-center">
            <p className="text-game text-lg text-gray-400">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
