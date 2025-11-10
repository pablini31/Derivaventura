import { useState, useEffect } from 'react'

const DEFAULT_SETTINGS = {
  audio: {
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    musicEnabled: true,
    sfxEnabled: true
  },
  display: {
    animations: true,
    particles: true
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('gameSettings')
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
  })

  useEffect(() => {
    localStorage.setItem('gameSettings', JSON.stringify(settings))
  }, [settings])

  const updateSettings = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  return { settings, updateSettings, resetSettings }
}

export function playClickSound() {
  const settings = JSON.parse(localStorage.getItem('gameSettings') || JSON.stringify(DEFAULT_SETTINGS))
  
  if (settings.audio.sfxEnabled) {
    const audio = new Audio('/click-sound.wav')
    audio.volume = settings.audio.sfxVolume * settings.audio.masterVolume
    audio.play().catch(err => console.log('Error playing click sound:', err))
  }
}
