import { useState, useEffect, useCallback } from 'react'
import '../styles/starwars-intro.css'

function StarWarsIntro({ onComplete }) {
  const [showIntro, setShowIntro] = useState(true)

  const handleComplete = useCallback(() => {
    setShowIntro(false)
    if (onComplete) onComplete()
  }, [onComplete])

  useEffect(() => {
    // Auto-completar después de 45 segundos
    const timer = setTimeout(() => {
      handleComplete()
    }, 45000)

    return () => clearTimeout(timer)
  }, [handleComplete])

  const handleSkip = () => {
    handleComplete()
  }

  if (!showIntro) return null

  return (
    <div className="star-wars-intro">
      {/* Botón para saltar */}
      <button 
        onClick={handleSkip}
        className="skip-button"
      >
        ⏩ Saltar Intro
      </button>

      {/* Texto inicial */}
      <div className="intro-text">
        En un laboratorio no muy lejano, en un tiempo... caótico...
      </div>

      {/* Logo del juego */}
      <div className="game-logo">
        DERIVAVENTURA
      </div>

      {/* Crawl text */}
      <div className="crawl-container">
        <div className="crawl">
          <div className="title">
            <p>Episodio I</p>
            <h1>LA AMENAZA DE LA DERIVADA</h1>
          </div>
          
          <div className="story">
            <p>
              ¡El caos reina en la ciudad! Una plaga de 
              entidades matemáticas salvajes, nacidas de un 
              error de cálculo, ha escapado del laboratorio 
              del brillante <strong>Dr. Derivatis</strong> y ahora 
              amenaza con distorsionar la realidad.
            </p>

            <p>
              En su obsesión por descubrir la fórmula de 
              la vida eterna, el Doctor estuvo a punto de 
              lograrlo. Solo necesitaba un último paso: 
              calcular su derivada. Pero en su emoción, 
              el Doctor cometió un error fatal.
            </p>

            <p>
              ¡Olvidó <strong>LA REGLA DE LA CADENA</strong>! 
              Este descuido ha corrompido la fórmula, 
              dando vida a sus propios errores. Ahora, 
              el Dr. Derivatis, desesperado, busca a la 
              única persona capaz de arreglarlo.
            </p>

            <p>
              Oculto de la horda de errores, el Doctor 
              ha enviado un mensaje de auxilio a su 
              estudiante estrella, su última esperanza... 
              <strong>TÚ</strong>.
            </p>

            <p>
              Tu misión: ¡Calcular la derivada correcta, 
              eliminar los errores y restaurar el orden 
              en la ciudad!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StarWarsIntro
