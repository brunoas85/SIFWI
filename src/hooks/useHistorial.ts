import { useState, useEffect } from 'react'
import { obtenerHistorialRango } from '../api/fwi'
import type { RegistroHistorial } from '../types'

export function useHistorial(id: string, fechaInicio: string, fechaFin: string) {
  const [datos, setDatos] = useState<RegistroHistorial[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !fechaInicio || !fechaFin) return
    setCargando(true)
    setError(null)
    obtenerHistorialRango(id, fechaInicio, fechaFin)
      .then((res) => setDatos(res.datos))
      .catch(() => setError('No se pudo cargar el historial'))
      .finally(() => setCargando(false))
  }, [id, fechaInicio, fechaFin])

  return { datos, cargando, error }
}
