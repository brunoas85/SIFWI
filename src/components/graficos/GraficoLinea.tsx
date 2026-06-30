import { useState, useMemo, useEffect, useRef, type ReactNode } from 'react'
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

  const [refIzq, setRefIzq] = useState('')
  const [refDer, setRefDer] = useState('')
  const [seleccionando, setSeleccionando] = useState(false)
  const [limiteIzq, setLimiteIzq] = useState<string | null>(null)
  const [limiteDer, setLimiteDer] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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

  // Ancho del gráfico cuando hay zoom: la región zoomeada ocupa ~880px, el resto es proporcional.
  // Cap en 60px/día: permite ver días individuales con etiquetas legibles (≥14 días llenan el contenedor).
  const anchoChart = useMemo(() => {
    if (!zoomed || !limiteIzq || !limiteDer || datos.length === 0) return undefined
    const diasEnZoom = datos.filter(d => {
      const dia = String(d.dia)
      return dia >= limiteIzq && dia <= limiteDer
    }).length
    if (diasEnZoom === 0) return undefined
    const pxPorDia = Math.min(60, 880 / diasEnZoom)
    return Math.round(datos.length * pxPorDia)
  }, [zoomed, datos, limiteIzq, limiteDer])

  // Ticks del eje X para la vista scrolleable: densidad según zoom
  const ticksScrolleable = useMemo(() => {
    if (!anchoChart || datos.length === 0) return INICIOS_MES
    const pxPorDia = anchoChart / datos.length
    let cadaDias: number
    if (pxPorDia >= 40) cadaDias = 1
    else if (pxPorDia >= 12) cadaDias = 7
    else if (pxPorDia >= 6) cadaDias = 14
    else return INICIOS_MES
    return datos.map(d => String(d.dia)).filter((_, i) => i % cadaDias === 0)
  }, [anchoChart, datos])

  // Scroll automático a la región zoomeada cuando se aplica el zoom
  useEffect(() => {
    if (!zoomed || !anchoChart || !scrollRef.current || !limiteIzq) return
    const idxIzq = datos.findIndex(d => String(d.dia) >= limiteIzq)
    if (idxIzq < 0) return
    const pxPorDia = anchoChart / datos.length
    const scrollX = Math.max(0, idxIzq * pxPorDia - 40)
    scrollRef.current.scrollLeft = scrollX
  }, [zoomed, anchoChart, datos, limiteIzq])

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
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 min-h-[24px]">
              <div className="flex flex-wrap gap-1.5">
                {controles}
              </div>
              {zoomed ? (
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-gray-400">Arrastrá para hacer más zoom</span>
                  <button
                    onClick={resetearZoom}
                    className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1"
                  >
                    ↺ Restablecer
                  </button>
                </div>
              ) : (
                <span className="text-xs text-gray-400 shrink-0">
                  Arrastrá para hacer zoom
                </span>
              )}
            </div>

            {zoomed ? (
              // Vista zoomeada: gráfico ancho scrolleable horizontalmente, con drag-to-zoom para afinar
              <div ref={scrollRef} className="overflow-x-auto rounded-lg">
                <div style={{ width: anchoChart ?? '100%', height: 540, minWidth: '100%' }}>
                  <LineChart
                    width={anchoChart ?? 900}
                    height={540}
                    data={datos}
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
                      ticks={ticksScrolleable}
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
                    <ReferenceArea
                      x1={limiteIzq}
                      x2={limiteDer}
                      fill="#6366f1"
                      fillOpacity={0.08}
                    />
                    {seleccionando && refIzq && refDer && (
                      <ReferenceArea
                        x1={refIzq}
                        x2={refDer}
                        fill="#6366f1"
                        fillOpacity={0.18}
                        stroke="#6366f1"
                        strokeOpacity={0.5}
                      />
                    )}
                    {lineas}
                  </LineChart>
                </div>
              </div>
            ) : (
              // Vista normal: responsive con drag-to-zoom
              <ResponsiveContainer width="100%" height={540}>
                <LineChart
                  data={datos}
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
                  {lineas}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </ModalAmpliado>
      )}
    </>
  )
}
