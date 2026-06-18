import { useState, useEffect } from 'react'
import { obtenerEstaciones } from '../api/fwi'
import type { ResumenEstacion } from '../types'

export function useEstaciones() {
  const [estaciones, setEstaciones] = useState<ResumenEstacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCargando(true)
    setError(null)
    obtenerEstaciones()
      .then(setEstaciones)
      .catch(() => setError('No se pudieron cargar las estaciones'))
      .finally(() => setCargando(false))
  }, [])

  return { estaciones, cargando, error }
}
