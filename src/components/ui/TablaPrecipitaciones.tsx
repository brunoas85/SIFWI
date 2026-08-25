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

// Estaciones con datos de fuente SMN (además de Chapelco, que ya trae el
// sufijo en el Excel): se agrega la marca para que quede igual de clara.
const ESTACIONES_SMN = ['bariloche']

function agregarSufijoSmn(nombre: string): string {
  if (ESTACIONES_SMN.includes(normalizarNombre(nombre)) && !/smn/i.test(nombre)) {
    return `${nombre} (SMN)`
  }
  return nombre
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
            const nombre = agregarSufijoSmn(String(row[0]))
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
      .map(([, v]) => ({ nombre: agregarSufijoSmn(v.nombre), valores: { [añoActual]: v.acumulado } }))

    return [...actualizadas, ...nuevas]
  }, [datos, vivoPorEstacion, añoActual])

  return (
    <div className="flex flex-col h-full">
      <h2 className="font-heading font-extrabold text-lg tracking-[-0.01em] mb-1">
        Precipitación anual <span className="font-body font-normal text-[13px]" style={{ color: 'var(--color-neutral-700)' }}>mm acumulados</span>
      </h2>

      <div className="flex-1 overflow-auto border-2 border-(--color-divider) mt-3" style={{ maxHeight: 472 }}>
        {cargando && <Cargando mensaje="Cargando..." />}

        {error && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-center px-6" style={{ color: 'var(--color-neutral-500)' }}>{error}</p>
          </div>
        )}

        {!cargando && !error && (
          <table className="table">
            <thead>
              <tr>
                <th className="text-left sticky top-0 z-[2]" style={{ background: 'var(--color-surface)' }}>
                  Estación
                </th>
                {años.map(año => (
                  <th key={año} className="text-right sticky top-0 z-[2] tabular-nums" style={{ background: 'var(--color-surface)' }}>
                    {año}
                    {año === añoActual && (
                      <span
                        title="Se actualiza día a día"
                        className="inline-block w-1.5 h-1.5 ml-1.5 align-middle"
                        style={{ background: 'var(--color-accent)' }}
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i}>
                  <td className="whitespace-nowrap font-medium">
                    {f.nombre}
                  </td>
                  {años.map(año => (
                    <td key={año} className="text-right tabular-nums whitespace-nowrap">
                      {f.valores[año] != null ? (
                        f.valores[año]
                      ) : (
                        <span style={{ color: 'var(--color-neutral-400)' }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
