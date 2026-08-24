import { useState, useEffect, useCallback } from 'react'
import { obtenerVistaDatosMeteor, obtenerClimaActualWu, obtenerClimaActualSmn } from '../api/fwi'
import type { VistaMeteorItem } from '../types'

// Únicas estaciones SMN activas: Chapelco y Bariloche.
const IDS_SMN = new Set(['87761', '87765'])

interface ValorVivo {
  temperatura: number
  humedad: number
  viento_kmh: number
  direccion: string
}

export function useVistaDatosMeteor() {
  const [datos, setDatos] = useState<VistaMeteorItem[]>([])
  const [actualizadoEn, setActualizadoEn] = useState<Date | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(() => {
    setCargando(true)
    setError(null)
    Promise.all([
      obtenerVistaDatosMeteor(),
      obtenerClimaActualWu().catch(() => null),
      obtenerClimaActualSmn().catch(() => null),
    ])
      .then(([reporte, vivoWu, vivoSmn]) => {
        // El reporte periódico cubre todas las estaciones (WU + SMN); lo pisamos
        // con los valores en vivo de WU y SMN, consultados a cada API externa en este momento.
        const ahora = new Date()
        const horaAhora = ahora.toTimeString().slice(0, 5)
        const vivoPorId = new Map<string, ValorVivo>()
        for (const v of vivoWu?.data ?? []) {
          vivoPorId.set(v.estacion, {
            temperatura: v.temperatura,
            humedad: v.humedad,
            viento_kmh: v.velocidad_viento,
            direccion: v.direccion_viento,
          })
        }
        for (const v of vivoSmn?.data ?? []) {
          if (!IDS_SMN.has(v.id)) continue
          vivoPorId.set(v.id, {
            temperatura: v.temperatura,
            humedad: v.humedad_relativa,
            viento_kmh: v.viento_intensidad,
            direccion: v.viento_direccion,
          })
        }
        const combinados = reporte.data.map(d => {
          const v = vivoPorId.get(d.estacion_id)
          if (!v) return d
          return {
            ...d,
            temperatura: v.temperatura,
            humedad: v.humedad,
            viento_kmh: v.viento_kmh,
            direccion: v.direccion,
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
