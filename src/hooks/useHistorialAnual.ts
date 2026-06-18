import { useState, useEffect } from 'react'
import { obtenerHistorialRango } from '../api/fwi'
import type { RegistroHistorial } from '../types'

export interface ResultadoAño {
  registros: RegistroHistorial[]
  error: string | null
}

export function useHistorialAnual(id: string, años: number[]) {
  const [resultados, setResultados] = useState<Record<number, ResultadoAño>>({})
  const [cargando, setCargando] = useState(false)

  const añosKey = [...años].sort().join(',')

  useEffect(() => {
    if (!id || años.length === 0) {
      setResultados({})
      return
    }
    setCargando(true)

    Promise.all(
      años.map(año =>
        obtenerHistorialRango(id, `${año}0101`, `${año}1231`)
          .then(res => [año, { registros: res.datos, error: null }] as [number, ResultadoAño])
          .catch(err => [año, { registros: [], error: err?.message ?? 'Error al cargar' }] as [number, ResultadoAño])
      )
    )
      .then(pares => setResultados(Object.fromEntries(pares)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, añosKey])

  return { resultados, cargando }
}
