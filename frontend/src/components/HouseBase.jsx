import { useState, useEffect } from 'react'

function HouseBase({ playerName = "JUGADOR", isUnderAttack = false }) {
  const [glowEffect, setGlowEffect] = useState(false)

  useEffect(() => {
    if (isUnderAttack) {
      setGlowEffect(true)
      const timer = setTimeout(() => setGlowEffect(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [isUnderAttack])

  return (
    <div className="relative flex flex-col items-center">
      {/* Casa SVG estilo Plants vs Zombies */}
      <svg 
        width="180" 
        height="150" 
        viewBox="0 0 140 120" 
        xmlns="http://www.w3.org/2000/svg"
        className={`drop-shadow-2xl transition-all duration-300 ${
          glowEffect ? 'filter brightness-110 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]' : ''
        } ${isUnderAttack ? 'animate-pulse' : ''}`}
      >
        {/* Sombra de la casa */}
        <ellipse cx="70" cy="115" rx="60" ry="8" fill="rgba(0,0,0,0.3)" />
        
        {/* Base de la casa */}
        <rect x="20" y="60" width="100" height="50" fill="#8B4513" stroke="#654321" strokeWidth="2" />
        
        {/* Techo */}
        <polygon 
          points="10,65 70,25 130,65" 
          fill="#DC143C" 
          stroke="#B22222" 
          strokeWidth="2"
        />
        
        {/* Chimenea */}
        <rect x="95" y="35" width="12" height="25" fill="#8B4513" stroke="#654321" strokeWidth="1" />
        <rect x="93" y="33" width="16" height="4" fill="#654321" />
        
        {/* Humo de la chimenea */}
        <circle cx="101" cy="28" r="3" fill="#E6E6FA" opacity="0.7" />
        <circle cx="104" cy="22" r="4" fill="#E6E6FA" opacity="0.5" />
        <circle cx="99" cy="16" r="3" fill="#E6E6FA" opacity="0.3" />
        
        {/* Puerta principal */}
        <rect x="60" y="80" width="20" height="30" fill="#654321" stroke="#4A4A4A" strokeWidth="2" rx="10" />
        <circle cx="75" cy="95" r="2" fill="#FFD700" /> {/* Perilla */}
        
        {/* Ventanas */}
        {/* Ventana izquierda */}
        <rect x="30" y="75" width="18" height="15" fill="#87CEEB" stroke="#4A4A4A" strokeWidth="2" />
        <line x1="39" y1="75" x2="39" y2="90" stroke="#4A4A4A" strokeWidth="1" />
        <line x1="30" y1="82.5" x2="48" y2="82.5" stroke="#4A4A4A" strokeWidth="1" />
        
        {/* Ventana derecha */}
        <rect x="92" y="75" width="18" height="15" fill="#87CEEB" stroke="#4A4A4A" strokeWidth="2" />
        <line x1="101" y1="75" x2="101" y2="90" stroke="#4A4A4A" strokeWidth="1" />
        <line x1="92" y1="82.5" x2="110" y2="82.5" stroke="#4A4A4A" strokeWidth="1" />
        
        {/* Ventana del ático */}
        <circle cx="70" cy="50" r="8" fill="#87CEEB" stroke="#4A4A4A" strokeWidth="2" />
        <line x1="70" y1="42" x2="70" y2="58" stroke="#4A4A4A" strokeWidth="1" />
        <line x1="62" y1="50" x2="78" y2="50" stroke="#4A4A4A" strokeWidth="1" />
        
        {/* Detalles decorativos */}
        {/* Flores en las ventanas */}
        <circle cx="35" cy="92" r="2" fill="#FF69B4" />
        <circle cx="43" cy="92" r="2" fill="#FF1493" />
        <circle cx="97" cy="92" r="2" fill="#FF69B4" />
        <circle cx="105" cy="92" r="2" fill="#FF1493" />
        
        {/* Escalones */}
        <rect x="55" y="108" width="30" height="4" fill="#696969" />
        <rect x="58" y="104" width="24" height="4" fill="#808080" />
        
        {/* Buzón */}
        <rect x="15" y="95" width="8" height="12" fill="#4169E1" />
        <rect x="14" y="93" width="10" height="3" fill="#191970" />
        <circle cx="22" cy="98" r="1" fill="#FFD700" />
      </svg>

      {/* Nombre del jugador */}
      <div className="text-game text-sm text-white bg-black/70 px-3 py-1 rounded-lg mt-2 border-2 border-yellow-400">
        <span className="font-bold">{playerName}</span>
      </div>

      {/* Indicador de salud de la casa */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <div className="w-24 h-3 bg-gray-700 rounded-full border border-gray-500">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isUnderAttack ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: '100%' }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default HouseBase