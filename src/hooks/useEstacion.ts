import { useState, useEffect } from 'react'
import { obtenerEstacion } from '../api/fwi'
import type { DetalleEstacion } from '../types'

export function useEstacion(id: string) {
  const [estacion, setEstacion] = useState<DetalleEstacion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setCargando(true)
    setError(null)
    obtenerEstacion(id)
      .then(setEstacion)
      .catch(() => setError('No se pudo cargar la estación'))
      .finally(() => setCargando(false))
  }, [id])

  return { estacion, cargando, error }
}
