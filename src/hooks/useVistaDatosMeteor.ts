import { useState, useEffect, useCallback } from 'react'
import { obtenerVistaDatosMeteor, obtenerClimaActualWu } from '../api/fwi'
import type { VistaMeteorItem } from '../types'

export function useVistaDatosMeteor() {
  const [datos, setDatos] = useState<VistaMeteorItem[]>([])
  const [actualizadoEn, setActualizadoEn] = useState<Date | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(() => {
    setCargando(true)
    setError(null)
    Promise.all([obtenerVistaDatosMeteor(), obtenerClimaActualWu().catch(() => null)])
      .then(([reporte, vivo]) => {
        // El reporte periódico cubre todas las estaciones (WU + SMN); lo pisamos
        // con los valores en vivo de WU, consultados a la API externa en este momento.
        const ahora = new Date()
        const horaAhora = ahora.toTimeString().slice(0, 5)
        const vivoPorId = new Map((vivo?.data ?? []).map(v => [v.estacion, v]))
        const combinados = reporte.data.map(d => {
          const v = vivoPorId.get(d.estacion_id)
          if (!v) return d
          return {
            ...d,
            temperatura: v.temperatura,
            humedad: v.humedad,
            viento_kmh: v.velocidad_viento,
            direccion: v.direccion_viento,
            hora: horaAhora,
          }
        })
        setDatos(combinados)
        setActualizadoEn(ahora)
      })
      .catch(() => setError('No se pudieron cargar los datos meteorológicos'))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  return { datos, actualizadoEn, cargando, error, recargar: cargar }
}
