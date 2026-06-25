import { useState, useMemo } from 'react'
import { useHistorialAnual } from '../../hooks/useHistorialAnual'
import { GraficoLinea } from './GraficoLinea'
import { Cargando } from '../ui/Cargando'
import { agregarPorDia, redondearMax, DIAS_DEL_ANIO } from '../../utils/series'
import type { RegistroHistorial } from '../../types'

const AÑO_ACTUAL = new Date().getFullYear()
const AÑO_INICIO_RED = 2022
const AÑOS_DISPONIBLES = Array.from(
  { length: AÑO_ACTUAL - AÑO_INICIO_RED + 1 },
  (_, i) => AÑO_INICIO_RED + i
)
const PALETA = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#dc2626', '#7c3aed']
const COLORES: Record<number, string> = Object.fromEntries(
  AÑOS_DISPONIBLES.map((año, i) => [año, PALETA[i % PALETA.length]])
)

export interface ConfigGrafico {
  titulo: string
  unidad: string
  getter: (r: RegistroHistorial) => number | null
  esSuma?: boolean
  dominioFijo?: [number, number]
}

interface Props {
  id: string
  titulo: string
  graficos: ConfigGrafico[]
  homologarEscalas?: boolean
}

export function GraficosSeriesAnuales({ id, titulo, graficos, homologarEscalas = true }: Props) {
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

  const conteos = useMemo(() =>
    Object.fromEntries(
      Object.entries(resultados).map(([k, v]) => [Number(k), v.registros.length])
    ),
    [resultados]
  )

  const errorGlobal = useMemo(() =>
    Object.values(resultados).find(v => v.error)?.error ?? null,
    [resultados]
  )

  const datosGraficos = useMemo(() => {
    return graficos.map(cfg => {
      const agregadosPorAño: Record<number, Record<string, number | null>> = {}
      añosSeleccionados.forEach(año => {
        const res = resultados[año]
        if (res?.registros?.length) {
          agregadosPorAño[año] = agregarPorDia(res.registros, cfg.getter, cfg.esSuma)
        }
      })

      const puntos = DIAS_DEL_ANIO.map(dia => {
        const punto: Record<string, string | number | null> = { dia }
        añosSeleccionados.forEach(año => {
          const raw = agregadosPorAño[año]?.[dia] ?? null
          punto[String(año)] = raw !== null ? parseFloat(raw.toFixed(2)) : null
        })
        return punto
      })

      const tieneDatos = puntos.some(p =>
        añosSeleccionados.some(año => p[String(año)] !== null)
      )

      return {
        titulo: cfg.titulo,
        unidad: cfg.unidad,
        esSuma: cfg.esSuma,
        dominioFijo: cfg.dominioFijo,
        puntos,
        tieneDatos,
      }
    })
  }, [resultados, añosSeleccionados, graficos])

  const maxComunResto = useMemo(() => {
    if (!homologarEscalas) return 0
    let max = 0
    datosGraficos.forEach(g => {
      if (g.dominioFijo) return
      g.puntos.forEach(p => {
        añosSeleccionados.forEach(año => {
          const v = p[String(año)]
          if (typeof v === 'number' && v > max) max = v
        })
      })
    })
    return redondearMax(max)
  }, [datosGraficos, añosSeleccionados, homologarEscalas])

  // Botones de año reutilizables (se pasan al modal de cada gráfico)
  const botonesAño = (
    <>
      {AÑOS_DISPONIBLES.map((año, i) => {
        const activo = añosSeleccionados.includes(año)
        const conteo = conteos[año]
        return (
          <button
            key={año}
            onClick={() => alternarAño(año)}
            title={conteo !== undefined ? `${conteo} registros` : undefined}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all ${
              activo
                ? 'bg-white border-gray-200 text-gray-700 font-medium shadow-sm'
                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-500'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0 transition-all"
              style={{ background: activo ? PALETA[i] : '#e5e7eb' }}
            />
            {año}
            {conteo === 0 && (
              <span className="text-[10px] text-gray-300">sin datos</span>
            )}
          </button>
        )
      })}
    </>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-red-600" />
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            {titulo}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {botonesAño}
          </div>
        </div>

        {errorGlobal && (
          <div className="mb-4 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            {errorGlobal}
          </div>
        )}

        {cargando ? (
          <Cargando mensaje="Cargando datos históricos..." />
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
                    dominio={homologarEscalas ? (g.dominioFijo ?? [0, maxComunResto]) : g.dominioFijo}
                    controles={botonesAño}
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
