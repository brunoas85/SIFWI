import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { Cargando } from './Cargando'

interface FilaEstacion {
  nombre: string
  valores: Record<number, number>
}

interface DatosTabla {
  años: number[]
  filas: FilaEstacion[]
}

export function TablaPrecipitaciones() {
  const [datos, setDatos] = useState<DatosTabla | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false
    fetch('/EstacionesAnual.xlsx')
      .then(r => r.arrayBuffer())
      .then(buf => {
        if (cancelado) return
        const wb = XLSX.read(buf, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1, defval: '' })

        // Fila 1 (índice 1): ["", año1, año2, ...]
        const añoRow = rows[1] as (string | number)[]
        const años = añoRow.slice(1).filter(v => typeof v === 'number' && v > 2000) as number[]

        // Filas 2+: [nombre, val1, val2, ...]
        const filas: FilaEstacion[] = rows.slice(2)
          .filter(row => row[0])
          .map(row => {
            const nombre = String(row[0])
            const valores: Record<number, number> = {}
            años.forEach((año, i) => {
              const v = row[i + 1]
              if (typeof v === 'number') valores[año] = v
            })
            return { nombre, valores }
          })

        setDatos({ años, filas })
        setCargando(false)
      })
      .catch(err => {
        if (!cancelado) { setError(err?.message ?? 'Error al cargar datos'); setCargando(false) }
      })
    return () => { cancelado = true }
  }, [])

  const años = datos?.años ?? []
  const filas = datos?.filas ?? []

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white flex flex-col">
      <div className="px-4 py-2.5 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50">
        <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
          Precipitaciones anuales · Parque Nacional Lanín
        </p>
      </div>

      <div className="flex-1 overflow-auto" style={{ height: 440 }}>
        {cargando && <Cargando mensaje="Cargando..." />}

        {error && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 text-center px-6">{error}</p>
          </div>
        )}

        {!cargando && !error && (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white border-b border-gray-100 z-10">
              <tr className="text-[11px] uppercase tracking-wide">
                <th className="text-left pl-4 pr-2 py-3 font-medium text-gray-400">
                  Estación
                </th>
                {años.map((año, i) => (
                  <th key={año} className={`text-right py-3 font-semibold text-blue-500 tabular-nums ${i === años.length - 1 ? 'pl-3 pr-4' : 'px-3'}`}>
                    {año}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                  <td className="pl-4 pr-2 py-2.5">
                    <span className="text-xs font-medium text-gray-800">{f.nombre}</span>
                  </td>
                  {años.map((año, i) => (
                    <td key={año} className={`py-2.5 text-right tabular-nums ${i === años.length - 1 ? 'pl-3 pr-4' : 'px-3'}`}>
                      {f.valores[año] != null ? (
                        <span className="text-xs font-semibold text-gray-700">
                          {f.valores[año]}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={años.length + 1} className="px-4 pt-2 pb-3 text-right">
                  <span className="text-xs text-gray-400">mm · acumulado anual</span>
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
