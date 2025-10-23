import { useEffect, useState } from 'react'

function ZombieCharacter({ equation = "x² + 3x", position = 0, isMoving = true }) {
  const [wobble, setWobble] = useState(0)

  useEffect(() => {
    if (!isMoving) return
    
    const interval = setInterval(() => {
      setWobble(prev => (prev + 1) % 360)
    }, 100)

    return () => clearInterval(interval)
  }, [isMoving])

  const wobbleOffset = Math.sin(wobble * Math.PI / 180) * 2

  return (
    <div 
      className="relative inline-block"
      style={{
        transform: `translateY(${wobbleOffset}px)`,
        transition: 'transform 0.1s ease-in-out'
      }}
    >
      {/* Ecuación flotante */}
      <div 
        className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white border-3 border-black rounded-lg px-3 py-2 shadow-lg z-10"
        style={{
          minWidth: '80px',
          animation: 'float 2s ease-in-out infinite'
        }}
      >
        <div className="text-center font-bold text-black text-sm md:text-base whitespace-nowrap">
          {equation}
        </div>
        {/* Pico del bocadillo */}
        <div 
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid black'
          }}
        ></div>
        <div 
          className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: '7px solid white'
          }}
        ></div>
      </div>

      {/* Zombie SVG */}
      <svg 
        width="80" 
        height="100" 
        viewBox="0 0 80 100" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Sombra */}
        <ellipse cx="40" cy="95" rx="25" ry="5" fill="rgba(0,0,0,0.3)" />
        
        {/* Cuerpo */}
        <rect x="25" y="45" width="30" height="35" fill="#6B8E9E" rx="3" />
        
        {/* Pantalones rasgados */}
        <rect x="25" y="75" width="13" height="20" fill="#1a1a2e" />
        <rect x="42" y="75" width="13" height="20" fill="#1a1a2e" />
        {/* Rasgaduras */}
        <path d="M 28 80 L 30 82 L 32 80 L 34 82 L 36 80" stroke="#2a2a3e" strokeWidth="1" fill="none" />
        <path d="M 44 85 L 46 87 L 48 85 L 50 87 L 52 85" stroke="#2a2a3e" strokeWidth="1" fill="none" />
        
        {/* Brazos extendidos */}
        {/* Brazo izquierdo */}
        <rect x="10" y="48" width="18" height="8" fill="#6B8E9E" rx="4" transform="rotate(-20 19 52)" />
        <circle cx="10" cy="52" r="5" fill="#7B9EAE" /> {/* Mano */}
        
        {/* Brazo derecho */}
        <rect x="52" y="48" width="18" height="8" fill="#6B8E9E" rx="4" transform="rotate(20 61 52)" />
        <circle cx="70" cy="52" r="5" fill="#7B9EAE" /> {/* Mano */}
        
        {/* Cabeza */}
        <ellipse cx="40" cy="30" rx="18" ry="20" fill="#7B9EAE" />
        
        {/* Orejas */}
        <ellipse cx="25" cy="30" rx="4" ry="6" fill="#6B8E9E" />
        <ellipse cx="55" cy="30" rx="4" ry="6" fill="#6B8E9E" />
        
        {/* Cabello despeinado */}
        <path d="M 25 15 Q 22 12 20 15 Q 25 10 30 12 Q 35 8 40 10 Q 45 8 50 12 Q 55 10 60 15 Q 58 12 55 15" 
              fill="#2a2a3e" stroke="#1a1a2e" strokeWidth="1" />
        
        {/* Ojos */}
        <ellipse cx="32" cy="28" rx="5" ry="6" fill="#FFF8DC" />
        <ellipse cx="48" cy="28" rx="5" ry="6" fill="#FFF8DC" />
        <circle cx="33" cy="29" r="3" fill="#1a1a2e" />
        <circle cx="49" cy="29" r="3" fill="#1a1a2e" />
        <circle cx="34" cy="28" r="1.5" fill="white" /> {/* Brillo */}
        <circle cx="50" cy="28" r="1.5" fill="white" /> {/* Brillo */}
        
        {/* Boca abierta */}
        <ellipse cx="40" cy="38" rx="8" ry="6" fill="#1a1a2e" />
        <rect x="36" y="36" width="3" height="5" fill="white" rx="1" /> {/* Diente */}
        <rect x="41" y="36" width="3" height="5" fill="white" rx="1" /> {/* Diente */}
        
        {/* Nariz */}
        <ellipse cx="40" cy="33" rx="2" ry="3" fill="#5B7E8E" />
        
        {/* Detalles zombie (cicatrices) */}
        <path d="M 28 25 L 30 26" stroke="#4a6a7a" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 52 32 L 54 31" stroke="#4a6a7a" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Pies */}
        <ellipse cx="31" cy="95" rx="6" ry="3" fill="#1a1a2e" />
        <ellipse cx="49" cy="95" rx="6" ry="3" fill="#1a1a2e" />
      </svg>
    </div>
  )
}

export default ZombieCharacter
