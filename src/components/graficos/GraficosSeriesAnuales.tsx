import { useState, useMemo } from 'react'
import { useHistorialAnual } from '../../hooks/useHistorialAnual'
import { GraficoLinea } from './GraficoLinea'
import { Cargando } from '../ui/Cargando'
import { agregarPorMes } from '../../utils/series'
import type { RegistroHistorial } from '../../types'

const AÑO_ACTUAL = new Date().getFullYear()
// La red de estaciones del PNL tiene registros desde 2022
const AÑO_INICIO_RED = 2022
const AÑOS_DISPONIBLES = Array.from(
  { length: AÑO_ACTUAL - AÑO_INICIO_RED + 1 },
  (_, i) => AÑO_INICIO_RED + i
)
// Gradiente inspirado en la escala de peligro FWI: de templado a extremo
const PALETA = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#dc2626', '#7c3aed']
const COLORES: Record<number, string> = Object.fromEntries(
  AÑOS_DISPONIBLES.map((año, i) => [año, PALETA[i % PALETA.length]])
)

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export interface ConfigGrafico {
  titulo: string
  unidad: string
  getter: (r: RegistroHistorial) => number | null
  esSuma?: boolean
}

interface Props {
  id: string
  titulo: string
  graficos: ConfigGrafico[]
}

export function GraficosSeriesAnuales({ id, titulo, graficos }: Props) {
  const [añosSeleccionados, setAñosSeleccionados] = useState<number[]>([
    AÑO_ACTUAL - 1,
    AÑO_ACTUAL,
  ])

  const { resultados, cargando } = useHistorialAnual(id, añosSeleccionados)

  const alternarAño = (año: number) => {
    setAñosSeleccionados(prev =>
      prev.includes(año)
        ? prev.filter(a => a !== año)
        : [...prev, año].sort()
    )
  }

  const datosGraficos = useMemo(() => {
    return graficos.map(cfg => {
      const agregadosPorAño: Record<number, (number | null)[]> = {}
      añosSeleccionados.forEach(año => {
        const res = resultados[año]
        if (res?.registros?.length) {
          agregadosPorAño[año] = agregarPorMes(res.registros, cfg.getter, cfg.esSuma)
        }
      })

      const puntos = MESES.map((mes, i) => {
        const punto: Record<string, string | number | null> = { mes }
        añosSeleccionados.forEach(año => {
          const vals = agregadosPorAño[año]
          const raw = vals?.[i] ?? null
          punto[String(año)] = raw !== null ? parseFloat(raw.toFixed(2)) : null
        })
        return punto
      })

      const tieneDatos = puntos.some(p =>
        añosSeleccionados.some(año => p[String(año)] !== null)
      )

      return { titulo: cfg.titulo, unidad: cfg.unidad, esSuma: cfg.esSuma, puntos, tieneDatos }
    })
  }, [resultados, añosSeleccionados, graficos])

  const conteos = useMemo(() =>
    Object.fromEntries(
      Object.entries(resultados).map(([k, v]) => [Number(k), v.registros.length])
    ),
    [resultados]
  )

  const erroresPorAño = useMemo(() =>
    Object.fromEntries(
      Object.entries(resultados)
        .filter(([, v]) => v.error)
        .map(([k, v]) => [Number(k), v.error])
    ),
    [resultados]
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-red-600" />
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            {titulo}
          </h2>
          <div className="flex flex-wrap gap-2">
            {AÑOS_DISPONIBLES.map((año, i) => {
              const activo = añosSeleccionados.includes(año)
              const conteo = conteos[año]
              return (
                <button
                  key={año}
                  onClick={() => alternarAño(año)}
                  title={erroresPorAño[año] ?? undefined}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    activo
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                  style={activo ? { background: PALETA[i], borderColor: PALETA[i] } : {}}
                >
                  {año}
                  {conteo !== undefined && (
                    <span className={`ml-1.5 text-xs font-normal ${activo ? 'opacity-75' : 'text-gray-400'}`}>
                      ({conteo === 0 ? 'sin datos' : `${conteo} reg.`})
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Errores por año */}
        {Object.entries(erroresPorAño).length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(erroresPorAño).map(([año, err]) => (
              <span key={año} className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                {año}: {err}
              </span>
            ))}
          </div>
        )}

        {cargando ? (
          <Cargando mensaje="Cargando datos anuales..." />
        ) : añosSeleccionados.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">
            Seleccioná al menos un año.
          </p>
        ) : (
          <div className="space-y-5">
            {datosGraficos.map(g => (
              <div key={g.titulo}>
                {g.tieneDatos ? (
                  <GraficoLinea
                    titulo={g.titulo}
                    unidad={g.unidad}
                    datos={g.puntos}
                    años={añosSeleccionados}
                    colores={COLORES}
                    esSuma={g.esSuma}
                  />
                ) : (
                  <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">{g.titulo}</p>
                    <p className="text-xs text-gray-400">
                      Sin datos para los años seleccionados.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
