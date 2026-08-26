import { useParams, useNavigate } from 'react-router-dom'
import { useEstacion } from '../hooks/useEstacion'
import { Cargando } from '../components/ui/Cargando'
import { MensajeError } from '../components/ui/MensajeError'
import { TablaHistorial } from '../components/ui/TablaHistorial'
import { GraficosAnuales } from '../components/graficos/GraficosAnuales'
import { GraficosIndicesFwi } from '../components/graficos/GraficosIndicesFwi'
import { f1, f2 } from '../utils/formato'
import { formatearFecha } from '../utils/fecha'
import { obtenerConfigEstado } from '../utils/fwi'

export function DetalleEstacion() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { estacion, cargando, error } = useEstacion(id ?? '')

  if (cargando) return <Cargando mensaje="Cargando datos de la estación..." />
  if (error || !estacion) return <MensajeError mensaje={error ?? 'Estación no encontrada'} />

  const config = obtenerConfigEstado(estacion['Estado FWI'])

  const meteo = [
    { etiqueta: 'Temperatura', valor: `${f1(estacion.Temp)} °C` },
    { etiqueta: 'Humedad relativa', valor: `${f1(estacion.HR)} %` },
    { etiqueta: 'Viento', valor: `${f1(estacion.WS)} km/h` },
    { etiqueta: 'Viento 10 m', valor: `${f1(estacion['W 10'])} km/h` },
    { etiqueta: 'Dirección', valor: estacion.WD },
    { etiqueta: 'Precipitación', valor: `${f2(estacion.PPT)} mm` },
    { etiqueta: 'Acumulado anual', valor: `${f2(estacion.Acum)} mm` },
    { etiqueta: 'Último registro', valor: `${formatearFecha(estacion.Date)} · ${estacion.Hora}` },
  ]

  const indices = [
    { etiqueta: 'FFMC', valor: f2(estacion.FFMC) },
    { etiqueta: 'DMC', valor: f2(estacion.DMC) },
    { etiqueta: 'DC', valor: f2(estacion.DC) },
    { etiqueta: 'ISI', valor: f2(estacion.ISI) },
    { etiqueta: 'BUI', valor: f2(estacion.BUI) },
    { etiqueta: 'FWI', valor: f2(estacion.FWI), destacado: true },
  ]

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-ghost text-sm mb-4">
        ← Volver
      </button>

      <div className="grid grid-cols-1 sm:[grid-template-columns:auto_minmax(0,1fr)] gap-[2px] border-b-2 border-(--color-divider)" style={{ background: 'var(--color-divider)' }}>
        <div className="flex flex-col justify-between sm:min-w-55 px-6 sm:px-8 py-6" style={{ background: config.tono, color: config.texto }}>
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase">FWI actual</p>
          <p className="mt-2 font-heading font-extrabold text-7xl leading-[0.9] tracking-[-0.04em] tabular-nums">
            {f1(estacion.FWI)}
          </p>
          <p className="mt-1.5 font-heading font-extrabold text-xl tracking-[-0.01em]">{config.etiqueta}</p>
        </div>
        <div
          className="grid [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] gap-x-6 gap-y-5 content-center px-6 sm:pl-6 sm:pr-0 py-6"
          style={{ background: 'var(--color-bg)' }}
        >
          {meteo.map(({ etiqueta, valor }) => (
            <div key={etiqueta}>
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: 'var(--color-neutral-700)' }}>
                {etiqueta}
              </p>
              <p className="font-heading font-extrabold text-[22px] tracking-[-0.015em] tabular-nums whitespace-nowrap">
                {valor}
              </p>
            </div>
          ))}
        </div>
      </div>

      <header className="flex flex-wrap items-baseline gap-3 py-4 border-b-2 border-(--color-divider)">
        <h1 className="font-heading font-extrabold text-3xl tracking-[-0.02em]">{estacion.nombre}</h1>
        <span className="text-xs ml-auto" style={{ color: 'var(--color-neutral-600)' }}>
          {estacion.api}
        </span>
      </header>

      <section className="border-b-2 border-(--color-divider) py-6">
        <h2 className="font-heading font-extrabold text-lg tracking-[-0.01em] mb-4">Índices FWI</h2>
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]">
          {indices.map(({ etiqueta, valor, destacado }) => (
            <div
              key={etiqueta}
              className="px-4.5 py-4"
              style={{ background: 'var(--color-bg)', borderRight: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)' }}
            >
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1.5" style={{ color: 'var(--color-neutral-700)' }}>
                {etiqueta}
              </p>
              <p
                className="font-heading font-extrabold text-2xl leading-none tracking-[-0.02em] tabular-nums"
                style={{ color: destacado ? config.tono : undefined }}
              >
                {valor}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="py-6 border-b-2 border-(--color-divider)">
        <GraficosAnuales id={id ?? ''} />
      </div>

      <div className="py-6 border-b-2 border-(--color-divider)">
        <GraficosIndicesFwi id={id ?? ''} />
      </div>

      <div className="py-6">
        <TablaHistorial id={id ?? ''} nombre={estacion.nombre} />
      </div>
    </div>
  )
}
