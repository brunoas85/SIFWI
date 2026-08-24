import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { normalizarNombre } from '../utils/nombreEstacion'

export interface EstacionOrden {
  nombre: string
  normalizado: string
}

// Orden de estaciones tal como figuran en EstacionesAnual.xlsx (mismo orden que
// la tabla de Precipitaciones anuales), para reutilizar en otras vistas.
export function useOrdenEstacionesPnl(): EstacionOrden[] {
  const [orden, setOrden] = useState<EstacionOrden[]>([])

  useEffect(() => {
    let cancelado = false
    fetch('/EstacionesAnual.xlsx')
      .then(r => r.arrayBuffer())
      .then(buf => {
        if (cancelado) return
        const wb = XLSX.read(buf, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1, defval: '' })
        const nombres = rows.slice(2)
          .filter(row => row[0])
          .map(row => {
            const nombre = String(row[0])
            return { nombre, normalizado: normalizarNombre(nombre) }
          })
          .filter(o => o.normalizado !== 'meliquina')
        setOrden(nombres)
      })
      .catch(() => {})
    return () => { cancelado = true }
  }, [])

  return orden
}
