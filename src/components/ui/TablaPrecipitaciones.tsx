import { useState, useEffect, useMemo } from 'react'
import * as XLSX from 'xlsx'
import { Cargando } from './Cargando'
import { obtenerVistaDatosMeteor } from '../../api/fwi'
import { normalizarNombre } from '../../utils/nombreEstacion'

interface FilaEstacion {
  nombre: string
  valores: Record<number, number>
}

interface DatosTabla {
  años: number[]
  filas: FilaEstacion[]
}

interface RegistroVivo {
  nombre: string
  acumulado: number
}

export function TablaPrecipitaciones() {
  const [datos, setDatos] = useState<DatosTabla | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vivoPorEstacion, setVivoPorEstacion] = useState<Record<string, RegistroVivo>>({})

  const añoActual = new Date().getFullYear()

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
          .filter(row => normalizarNombre(String(row[0])) !== 'meliquina')
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

  // Precipitación acumulada del año en curso: se consulta en vivo para que se actualice día a día
  useEffect(() => {
    let cancelado = false
    obtenerVistaDatosMeteor()
      .then(res => {
        if (cancelado) return
        const mapa: Record<string, RegistroVivo> = {}
        res.data.forEach(e => {
          mapa[normalizarNombre(e.estacion)] = { nombre: e.estacion, acumulado: e.acumulado }
        })
        setVivoPorEstacion(mapa)
      })
      .catch(() => {})
    return () => { cancelado = true }
  }, [])

  const años = useMemo(() => {
    const base = datos?.años ?? []
    return base.includes(añoActual) ? base : [...base, añoActual]
  }, [datos, añoActual])

  const filas = useMemo(() => {
    const base = datos?.filas ?? []
    const clavesBase = new Set(base.map(f => normalizarNombre(f.nombre)))

    const actualizadas = base.map(f => {
      const vivo = vivoPorEstacion[normalizarNombre(f.nombre)]
      if (!vivo) return f
      return { ...f, valores: { ...f.valores, [añoActual]: vivo.acumulado } }
    })

    const nuevas: FilaEstacion[] = Object.entries(vivoPorEstacion)
      .filter(([clave]) => !clavesBase.has(clave))
      .map(([, v]) => ({ nombre: v.nombre, valores: { [añoActual]: v.acumulado } }))

    return [...actualizadas, ...nuevas]
  }, [datos, vivoPorEstacion, añoActual])

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white flex flex-col">
      <div className="px-4 py-2 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50">
        <p className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
          Precipitaciones anuales · Parque Nacional Lanín
        </p>
      </div>

      <div className="flex-1 overflow-auto" style={{ maxHeight: 480 }}>
        {cargando && <Cargando mensaje="Cargando..." />}

        {error && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 text-center px-6">{error}</p>
          </div>
        )}

        {!cargando && !error && (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white border-b border-gray-100 z-10">
              <tr className="text-xs uppercase tracking-wide">
                <th className="text-left pl-4 pr-4 py-3 font-medium text-gray-400">
                  Estación
                </th>
                {años.map(año => (
                  <th key={año} className="whitespace-nowrap text-right py-3 px-3 font-semibold text-blue-500 tabular-nums">
                    {año}
                    {año === añoActual && (
                      <span
                        title="Se actualiza día a día"
                        className="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-1.5 align-middle"
                      />
                    )}
                  </th>
                ))}
                <th className="w-3" />
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                  <td className="pl-4 pr-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">
                    {f.nombre}
                  </td>
                  {años.map(año => (
                    <td key={año} className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                      {f.valores[año] != null ? (
                        <span className="font-semibold text-gray-700">{f.valores[año]}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  ))}
                  <td />
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={años.length + 1} className="px-4 pt-2 pb-2.5 text-right">
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
