import { useState, useEffect, useCallback } from 'react'
import { obtenerVistaDatosMeteor, obtenerClimaActualWu, obtenerClimaActualSmn } from '../api/fwi'
import type { VistaMeteorItem } from '../types'

// Únicas estaciones SMN activas: Chapelco y Bariloche.
export const IDS_SMN = new Set(['87761', '87765'])

interface ValorVivo {
  temperatura: number
  humedad: number
  viento_kmh: number
  direccion: string
  fecha: string
  hora: string
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
        const fechaAhora = ahora.toISOString().slice(0, 10)
        const horaAhora = ahora.toTimeString().slice(0, 5)
        const vivoPorId = new Map<string, ValorVivo>()
        for (const v of vivoWu?.data ?? []) {
          // WU no informa su propia fecha/hora de observación: al ser una
          // consulta en vivo a la API externa, usamos el momento de la consulta.
          vivoPorId.set(v.estacion, {
            temperatura: v.temperatura,
            humedad: v.humedad,
            viento_kmh: v.velocidad_viento,
            direccion: v.direccion_viento,
            fecha: fechaAhora,
            hora: horaAhora,
          })
        }
        for (const v of vivoSmn?.data ?? []) {
          if (!IDS_SMN.has(v.id)) continue
          // El SMN sí informa la fecha/hora real de su medición (se actualiza
          // cada 1 hora): se usa esa, no el momento de la consulta.
          vivoPorId.set(v.id, {
            temperatura: v.temperatura,
            humedad: v.humedad_relativa,
            viento_kmh: v.viento_intensidad,
            direccion: v.viento_direccion,
            fecha: v.fecha,
            hora: v.hora,
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
            fecha: v.fecha,
            hora: v.hora,
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
