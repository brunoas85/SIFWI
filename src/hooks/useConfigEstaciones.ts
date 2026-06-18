import { useState, useEffect } from 'react'
import { obtenerConfigEstaciones } from '../api/fwi'
import type { ConfiguracionEstacion } from '../types'

export function useConfigEstaciones() {
  const [config, setConfig] = useState<Record<string, ConfiguracionEstacion>>({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCargando(true)
    setError(null)
    obtenerConfigEstaciones()
      .then(setConfig)
      .catch(() => setError('No se pudo cargar la configuración de estaciones'))
      .finally(() => setCargando(false))
  }, [])

  return { config, cargando, error }
}
