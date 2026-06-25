import { useState, useEffect, useMemo } from 'react'
import { obtenerHistorial } from '../api/fwi'
import type { RegistroHistorial } from '../types'

export interface ResultadoAño {
  registros: RegistroHistorial[]
  error: string | null
}

// Carga el historial completo de la estación una sola vez y filtra por año
// en memoria. Esto evita race conditions y problemas con el endpoint /rango.
export function useHistorialAnual(id: string, años: number[]) {
  const [todosLosRegistros, setTodosLosRegistros] = useState<RegistroHistorial[]>([])
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!id) { setTodosLosRegistros([]); setErrorCarga(null); return }
    let cancelado = false
    setCargando(true)
    setErrorCarga(null)

    obtenerHistorial(id)
      .then(res => { if (!cancelado) setTodosLosRegistros(res.datos ?? []) })
      .catch(err => { if (!cancelado) setErrorCarga(err?.message ?? 'Error al cargar historial') })
      .finally(() => { if (!cancelado) setCargando(false) })

    return () => { cancelado = true }
  }, [id])

  const resultados = useMemo((): Record<number, ResultadoAño> => {
    if (errorCarga) {
      return Object.fromEntries(
        años.map(año => [año, { registros: [], error: errorCarga }])
      )
    }
    return Object.fromEntries(
      años.map(año => {
        const registros = todosLosRegistros.filter(r => {
          const yrStr = String(r.Date ?? '').replace(/-/g, '').slice(0, 4)
          return parseInt(yrStr, 10) === año
        })
        return [año, { registros, error: null }]
      })
    )
  }, [todosLosRegistros, años, errorCarga])

  return { resultados, cargando }
}
