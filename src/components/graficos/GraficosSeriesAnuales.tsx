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
// Paleta cualitativa: colores de familias (hue) bien separadas entre sí,
// no variaciones de tono de un mismo color, para que cada año se distinga
// de un vistazo aunque haya varias curvas superpuestas.
const PALETA = ['#0ea5e9', '#f59e0b', '#16a34a', '#7c3aed', '#dc2626', '#0891b2']
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
  titulo?: string
  graficos: ConfigGrafico[]
  homologarEscalas?: boolean
  disposicion?: 'vertical' | 'horizontal'
  escalaFija?: boolean
}

export function GraficosSeriesAnuales({ id, titulo, graficos, homologarEscalas = true, disposicion = 'vertical', escalaFija = false }: Props) {
  const [añosSeleccionados, setAñosSeleccionados] = useState<number[]>([
    AÑO_ACTUAL - 1,
    AÑO_ACTUAL,
  ])

  const { resultados, cargando, registrosCompletos } = useHistorialAnual(id, añosSeleccionados)

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

  // Dominio fijo por gráfico calculado sobre TODO el historial (no solo los años tildados),
  // para que la escala de cada índice no cambie al activar/desactivar años.
  const dominiosFijosPorGrafico = useMemo(() => {
    if (!escalaFija) return {}
    const doms: Record<string, [number, number]> = {}
    graficos.forEach(cfg => {
      if (cfg.dominioFijo) return
      let max = 0
      registrosCompletos.forEach(r => {
        const v = cfg.getter(r)
        if (v !== null && v > max) max = v
      })
      doms[cfg.titulo] = [0, redondearMax(max)]
    })
    return doms
  }, [escalaFija, graficos, registrosCompletos])

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
            className="tag"
            style={{
              border: '1px solid var(--color-divider)',
              background: activo ? 'var(--color-neutral-100)' : 'transparent',
              color: activo ? 'var(--color-text)' : 'var(--color-neutral-500)',
              fontWeight: activo ? 600 : 400,
              gap: 6,
            }}
          >
            <span
              className="w-2 h-2 shrink-0"
              style={{ background: activo ? PALETA[i] : 'var(--color-neutral-300)' }}
            />
            {año}
            {conteo === 0 && (
              <span className="text-[10px]" style={{ color: 'var(--color-neutral-400)' }}>sin datos</span>
            )}
          </button>
        )
      })}
    </>
  )

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {titulo && (
          <h2 className="font-heading font-extrabold text-lg tracking-[-0.01em]">
            {titulo}
          </h2>
        )}
        <div className="flex flex-wrap gap-1.5 ml-auto">
          {botonesAño}
        </div>
      </div>

      {errorGlobal && (
        <div className="mb-4 text-xs px-3 py-2" style={{ color: 'var(--color-accent-700)', background: 'var(--color-accent-100)' }}>
          {errorGlobal}
        </div>
      )}

      {cargando ? (
        <Cargando mensaje="Cargando datos históricos..." />
      ) : añosSeleccionados.length === 0 ? (
        <p className="text-sm text-center py-10" style={{ color: 'var(--color-neutral-500)' }}>
          Seleccioná al menos un año.
        </p>
      ) : (
        <div className={disposicion === 'horizontal' ? 'grid grid-cols-1 lg:grid-cols-3 gap-5' : 'space-y-5'}>
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
                  dominio={
                    escalaFija
                      ? (g.dominioFijo ?? dominiosFijosPorGrafico[g.titulo])
                      : homologarEscalas ? (g.dominioFijo ?? [0, maxComunResto]) : g.dominioFijo
                  }
                  controles={botonesAño}
                />
              ) : (
                <div className="border-2 border-(--color-divider) p-4">
                  <p className="text-sm font-semibold mb-1">{g.titulo}</p>
                  <p className="text-xs" style={{ color: 'var(--color-neutral-500)' }}>
                    Sin datos para los años seleccionados.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
