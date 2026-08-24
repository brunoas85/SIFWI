import { useState, useEffect, useCallback } from 'react'
import { obtenerVistaDatosMeteor, obtenerClimaActualWu, obtenerClimaActualSmn } from '../api/fwi'
import type { VistaMeteorItem, ClimaActualWuItem, ClimaActualSmnItem } from '../types'

// Únicas estaciones SMN activas: Chapelco y Bariloche.
const IDS_SMN = new Set(['87761', '87765'])

type ValorVivo = Pick<
  ClimaActualWuItem | ClimaActualSmnItem,
  'temperatura' | 'humedad' | 'velocidad_viento' | 'direccion_viento'
>

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
        const vivoPorId = new Map<string, ValorVivo>((vivoWu?.data ?? []).map(v => [v.estacion, v]))
        for (const v of vivoSmn?.data ?? []) {
          if (IDS_SMN.has(v.estacion)) vivoPorId.set(v.estacion, v)
        }
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
