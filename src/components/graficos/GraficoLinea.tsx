import { useState, useMemo, type ReactNode } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceArea,
} from 'recharts'
import { ModalAmpliado } from '../ui/ModalAmpliado'

interface Props {
  titulo: string
  unidad: string
  datos: Record<string, string | number | null>[]
  años: number[]
  colores: Record<number, string>
  esSuma?: boolean
  dominio?: [number, number]
  controles?: ReactNode
}

const INICIOS_MES = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}-01`)

function formatearEtiquetaDia(valor: string) {
  const [mes, dia] = valor.split('-')
  return `${dia}/${mes}`
}

export function GraficoLinea({ titulo, unidad, datos, años, colores, esSuma, dominio, controles }: Props) {
  const [expandido, setExpandido] = useState(false)

  // Estado de zoom (sólo activo en el modal)
  const [refIzq, setRefIzq] = useState('')
  const [refDer, setRefDer] = useState('')
  const [seleccionando, setSeleccionando] = useState(false)
  const [limiteIzq, setLimiteIzq] = useState<string | null>(null)
  const [limiteDer, setLimiteDer] = useState<string | null>(null)

  const zoomed = !!(limiteIzq && limiteDer)

  const resetearZoom = () => {
    setRefIzq(''); setRefDer('')
    setLimiteIzq(null); setLimiteDer(null)
    setSeleccionando(false)
  }

  const aplicarZoom = () => {
    if (!refIzq || !refDer || refIzq === refDer) { resetearZoom(); return }
    const [l, r] = refIzq < refDer ? [refIzq, refDer] : [refDer, refIzq]
    setLimiteIzq(l); setLimiteDer(r)
    setRefIzq(''); setRefDer(''); setSeleccionando(false)
  }

  const datosZoom = useMemo(() => {
    if (!limiteIzq || !limiteDer) return datos
    return datos.filter(d => {
      const dia = String(d.dia)
      return dia >= limiteIzq && dia <= limiteDer
    })
  }, [datos, limiteIzq, limiteDer])

  const ticksZoom = useMemo(() => {
    if (!limiteIzq || !limiteDer) return INICIOS_MES
    const filtrados = INICIOS_MES.filter(t => t >= limiteIzq && t <= limiteDer)
    return filtrados.length > 0 ? filtrados : undefined
  }, [limiteIzq, limiteDer])

  const lineas = años.map(año => (
    <Line
      key={año}
      type="monotone"
      dataKey={String(año)}
      name={String(año)}
      stroke={colores[año]}
      strokeWidth={2}
      dot={false}
      connectNulls
      activeDot={{ r: 4 }}
    />
  ))

  return (
    <>
      {/* Tarjeta compacta */}
      <div
        onClick={() => setExpandido(true)}
        title="Clic para ampliar con zoom"
        className="bg-gray-50 rounded-xl border border-gray-100 p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
      >
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-sm">{titulo}</h3>
          <span className="text-xs text-gray-400">
            {esSuma ? 'acumulado diario' : 'valor diario'} · {unidad}
          </span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datos} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="dia"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickFormatter={formatearEtiquetaDia}
              ticks={INICIOS_MES}
            />
            <YAxis
              domain={dominio ?? ['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              width={48}
              tickFormatter={v => `${v}${unidad}`}
            />
            <Tooltip
              labelFormatter={label => typeof label === 'string' ? formatearEtiquetaDia(label) : label}
              formatter={value => typeof value === 'number' ? [`${value.toFixed(1)} ${unidad}`, ''] : ['-', '']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {lineas}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Modal ampliado con controles de año y zoom por arrastre */}
      {expandido && (
        <ModalAmpliado
          titulo={titulo}
          onClose={() => { setExpandido(false); resetearZoom() }}
        >
          <div className="select-none">
            {/* Controles de año + hint de zoom en la misma fila */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 min-h-[24px]">
              <div className="flex flex-wrap gap-1.5">
                {controles}
              </div>
              {zoomed ? (
                <button
                  onClick={resetearZoom}
                  className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1 shrink-0"
                >
                  ↺ Restablecer zoom
                </button>
              ) : (
                <span className="text-xs text-gray-400 shrink-0">
                  Arrastrá para hacer zoom
                </span>
              )}
            </div>

            <ResponsiveContainer width="100%" height={540}>
              <LineChart
                data={datosZoom}
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                style={{ cursor: seleccionando ? 'ew-resize' : 'crosshair' }}
                onMouseDown={e => {
                  const label = e?.activeLabel
                  if (label) { setRefIzq(String(label)); setSeleccionando(true) }
                }}
                onMouseMove={e => {
                  if (seleccionando) {
                    const label = e?.activeLabel
                    if (label) setRefDer(String(label))
                  }
                }}
                onMouseUp={aplicarZoom}
                onMouseLeave={() => { if (seleccionando) resetearZoom() }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="dia"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickFormatter={formatearEtiquetaDia}
                  ticks={ticksZoom}
                />
                <YAxis
                  domain={dominio ?? ['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  width={48}
                  tickFormatter={v => `${v}${unidad}`}
                />
                <Tooltip
                  labelFormatter={label => typeof label === 'string' ? formatearEtiquetaDia(label) : label}
                  formatter={value => typeof value === 'number' ? [`${value.toFixed(1)} ${unidad}`, ''] : ['-', '']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {lineas}
                {seleccionando && refIzq && refDer && (
                  <ReferenceArea
                    x1={refIzq}
                    x2={refDer}
                    fill="#6366f1"
                    fillOpacity={0.12}
                    stroke="#6366f1"
                    strokeOpacity={0.4}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ModalAmpliado>
      )}
    </>
  )
}
