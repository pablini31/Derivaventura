import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, ArrowLeft, Loader, Heart } from 'lucide-react'
import axios from 'axios'

function DailyChallengePage() {
  const navigate = useNavigate()
  const [pregunta, setPregunta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchPreguntaDiaria()
  }, [])

  const fetchPreguntaDiaria = async () => {
    try {
      const response = await axios.get('/api/preguntadiaria')
      setPregunta(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error al obtener pregunta diaria:', err)
      setError(err.response?.data?.mensaje || 'No hay pregunta diaria disponible')
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedAnswer) return

    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    // Decodificar el token para obtener el ID del jugador
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const idJugador = payload.idJugador

      const response = await axios.post('/api/preguntadiaria/responder', {
        idPregunta: pregunta.id_pregunta_diaria,
        respuesta: selectedAnswer,
        idJugador: idJugador
      })

      setResultado(response.data)
      setSubmitted(true)
    } catch (err) {
      console.error('Error al enviar respuesta:', err)
      setError('Error al enviar la respuesta')
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        {/* Botón de regreso */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 text-game text-xl">
          <ArrowLeft size={20} />
          <span>Volver al menú</span>
        </Link>

        {/* Título */}
        <div className="text-center mb-8">
          <Calendar className="w-20 h-20 text-blue-400 mx-auto mb-4 glow-animation" strokeWidth={2.5} />
          <h1 className="text-pixel text-4xl text-white mb-2">
            DESAFÍO DIARIO
          </h1>
          <p className="text-game text-2xl text-purple-300">
            Gana 1 vida extra respondiendo correctamente
          </p>
        </div>

        {/* Contenido */}
        <div className="card-pixel">
          {loading ? (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
              <p className="text-game text-xl text-purple-300">Cargando desafío...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-game text-xl text-red-400 mb-4">{error}</p>
              <p className="text-game text-lg text-gray-400">
                Vuelve mañana para un nuevo desafío
              </p>
            </div>
          ) : resultado ? (
            <div className="text-center py-12">
              {resultado.esCorrecta ? (
                <>
                  <div className="text-6xl mb-4 animate-bounce">✓</div>
                  <h2 className="text-pixel text-3xl text-green-400 mb-4">
                    ¡CORRECTO!
                  </h2>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Heart className="text-red-500" size={32} />
                    <p className="text-game text-2xl text-white">
                      +1 Vida Extra
                    </p>
                  </div>
                  <p className="text-game text-xl text-purple-300">
                    {resultado.mensaje}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4 shake-animation">✗</div>
                  <h2 className="text-pixel text-3xl text-red-400 mb-4">
                    INCORRECTO
                  </h2>
                  <p className="text-game text-xl text-purple-300 mb-4">
                    {resultado.mensaje}
                  </p>
                  <p className="text-game text-lg text-gray-400">
                    La respuesta correcta era: <span className="text-white">{pregunta.respuesta_correcta}</span>
                  </p>
                </>
              )}
              <Link to="/dashboard" className="inline-block mt-8">
                <button className="btn-pixel">
                  VOLVER AL MENÚ
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Enunciado */}
              <div className="bg-purple-900/50 border-4 border-purple-600 p-6 rounded-lg">
                <h3 className="text-game text-2xl text-purple-300 mb-4">
                  CALCULA LA DERIVADA:
                </h3>
                <p className="text-game text-3xl text-white text-center">
                  {pregunta.enunciado_funcion}
                </p>
              </div>

              {/* Opciones de respuesta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'A', value: pregunta.respuesta_correcta },
                  { label: 'B', value: pregunta.opcion_b },
                  { label: 'C', value: pregunta.opcion_c },
                  { label: 'D', value: pregunta.opcion_d }
                ].map((opcion) => (
                  <button
                    key={opcion.label}
                    onClick={() => setSelectedAnswer(opcion.value)}
                    disabled={submitted}
                    className={`p-6 text-game text-2xl border-4 rounded-lg transition-all ${
                      selectedAnswer === opcion.value
                        ? 'bg-purple-600 border-purple-400 scale-105'
                        : 'bg-slate-800/80 border-purple-700 hover:bg-purple-900/50'
                    } ${submitted ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                  >
                    <span className="text-purple-300">{opcion.label}:</span>{' '}
                    <span className="text-white">{opcion.value}</span>
                  </button>
                ))}
              </div>

              {/* Botón enviar */}
              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer || submitted}
                  className={selectedAnswer && !submitted ? 'btn-pixel-success text-xl px-8 py-4' : 'btn-pixel-disabled text-xl px-8 py-4'}
                >
                  ENVIAR RESPUESTA
                </button>
              </div>

              {/* Nota */}
              <div className="bg-blue-900/30 border-2 border-blue-600/50 p-4 rounded-lg">
                <p className="text-game text-lg text-blue-200 text-center">
                  💡 Solo puedes responder una vez al día. ¡Piénsalo bien!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DailyChallengePage
