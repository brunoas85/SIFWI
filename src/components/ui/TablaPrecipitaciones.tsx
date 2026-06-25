import { useState, useEffect, useMemo } from 'react'
import { obtenerHistorial, obtenerConfigEstaciones } from '../../api/fwi'
import { Cargando } from './Cargando'

const AÑO_ACTUAL = new Date().getFullYear()
const AÑO_INICIO_RED = 2022
const AÑOS = Array.from(
  { length: AÑO_ACTUAL - AÑO_INICIO_RED + 1 },
  (_, i) => AÑO_INICIO_RED + i
)

interface FilaEstacion {
  nombre: string
  sumas: Record<number, number>
}

export function TablaPrecipitaciones() {
  const [filas, setFilas] = useState<FilaEstacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [progreso, setProgreso] = useState(0)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    obtenerConfigEstaciones()
      .then(config => {
        const activas = Object.entries(config).filter(([, cfg]) => cfg.activa)
        if (cancelado) return
        setTotal(activas.length)

        const resultados: FilaEstacion[] = []

        return Promise.all(
          activas.map(([id, cfg]) =>
            obtenerHistorial(id)
              .then(res => {
                const sumas: Record<number, number> = {}
                res.datos.forEach(r => {
                  const yrStr = String(r.Date ?? '').replace(/-/g, '').slice(0, 4)
                  const año = parseInt(yrStr, 10)
                  const ppt = parseFloat(String(r.PPT))
                  if (!isNaN(año) && !isNaN(ppt) && ppt >= 0) {
                    sumas[año] = (sumas[año] ?? 0) + ppt
                  }
                })
                resultados.push({ nombre: cfg.nombre, sumas })
              })
              .catch(() => {
                resultados.push({ nombre: cfg.nombre, sumas: {} })
              })
              .finally(() => {
                if (!cancelado) setProgreso(p => p + 1)
              })
          )
        ).then(() => {
          if (!cancelado) {
            setFilas(resultados.sort((a, b) => a.nombre.localeCompare(b.nombre)))
            setCargando(false)
          }
        })
      })
      .catch(err => {
        if (!cancelado) { setError(err?.message ?? 'Error al cargar datos'); setCargando(false) }
      })

    return () => { cancelado = true }
  }, [])

  const añosConDatos = useMemo(
    () => AÑOS.filter(año => filas.some(f => (f.sumas[año] ?? 0) > 0)),
    [filas]
  )

  const mensajeCarga = total > 0
    ? `Cargando estaciones... ${progreso}/${total}`
    : 'Cargando...'

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white flex flex-col">
      <div className="px-4 py-2.5 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50">
        <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
          Precipitaciones anuales · Parque Nacional Lanín
        </p>
      </div>

      <div className="flex-1 overflow-auto" style={{ height: 440 }}>
        {cargando && <Cargando mensaje={mensajeCarga} />}

        {error && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 text-center px-6">{error}</p>
          </div>
        )}

        {!cargando && !error && (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white border-b border-gray-100 z-10">
              <tr className="text-[11px] uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium text-gray-400">
                  Estación
                </th>
                {añosConDatos.map(año => (
                  <th key={año} className="text-right px-4 py-3 font-semibold text-blue-500 tabular-nums">
                    {año}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-medium text-gray-800">{f.nombre}</span>
                  </td>
                  {añosConDatos.map(año => (
                    <td key={año} className="px-4 py-2.5 text-right tabular-nums">
                      {(f.sumas[año] ?? 0) > 0 ? (
                        <span className="text-xs font-semibold text-gray-700">
                          {Math.round(f.sumas[año])}
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
                <td colSpan={añosConDatos.length + 1} className="px-4 pt-2 pb-3 text-right">
                  <span className="text-[10px] text-gray-300">mm · acumulado anual</span>
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
