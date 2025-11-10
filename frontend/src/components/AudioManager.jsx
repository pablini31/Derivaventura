import { useEffect, useRef } from 'react'

function AudioManager({ track, volume = 0.5, loop = true }) {
  const audioRef = useRef(null)

  useEffect(() => {
    // Crear elemento de audio si no existe
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume
      audioRef.current.loop = loop
    }

    const audio = audioRef.current

    // Cambiar la pista si es diferente
    if (track && audio.src !== track) {
      audio.src = track
      
      // Intentar reproducir
      const playPromise = audio.play()
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('🎵 Audio reproduciendo:', track)
          })
          .catch(error => {
            console.log('⚠️ Autoplay bloqueado. El usuario debe interactuar primero.', error)
          })
      }
    }

    // Cleanup: pausar y limpiar cuando el componente se desmonte o cambie la pista
    return () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [track, volume, loop])

  // Actualizar volumen si cambia
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  return null // Este componente no renderiza nada
}

export default AudioManager
