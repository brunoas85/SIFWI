import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useEstaciones } from '../hooks/useEstaciones'
import { useConfigEstaciones } from '../hooks/useConfigEstaciones'
import { TarjetaEstacion } from '../components/ui/TarjetaEstacion'
import { MapaEstaciones } from '../components/ui/MapaEstaciones'
import { TablaPrecipitaciones } from '../components/ui/TablaPrecipitaciones'
import { Cargando } from '../components/ui/Cargando'
import { MensajeError } from '../components/ui/MensajeError'
import { obtenerConfigEstado } from '../utils/fwi'
import { f1 } from '../utils/formato'

export function Inicio() {
  const { estaciones, cargando, error } = useEstaciones()
  const { config } = useConfigEstaciones()

  const conFwi = useMemo(
    () => estaciones
      .map(e => ({ ...e, fwiNum: parseFloat(e.fwi) }))
      .filter(e => !isNaN(e.fwiNum)),
    [estaciones]
  )

  const promedio = conFwi.length
    ? conFwi.reduce((a, e) => a + e.fwiNum, 0) / conFwi.length
    : null

  const masCritica = useMemo(
    () => [...conFwi].sort((a, b) => b.fwiNum - a.fwiNum)[0] ?? null,
    [conFwi]
  )

  if (cargando) return <Cargando mensaje="Cargando estaciones..." />
  if (error) return <MensajeError mensaje={error} />

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4 pb-4 mb-2 border-b-2 border-(--color-divider)">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--color-neutral-700)' }}>
            Parque Nacional Lanín
          </p>
          <h1 className="font-heading font-extrabold text-3xl tracking-[-0.02em]">Panel de peligrosidad</h1>
        </div>
        <Link to="/variables-meteorologicas" className="btn btn-secondary text-sm">
          Ver variables meteorológicas actuales
        </Link>
      </header>

      {estaciones.length === 0 ? (
        <p className="text-center py-16" style={{ color: 'var(--color-neutral-500)' }}>No hay estaciones disponibles.</p>
      ) : (
        <>
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] border-b-2 border-(--color-divider)">
            <div className="pr-6 py-6 border-r border-(--color-neutral-300)">
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--color-neutral-700)' }}>
                FWI promedio del parque
              </p>
              <p className="font-heading font-extrabold text-4xl tracking-[-0.03em]">
                {promedio !== null ? promedio.toFixed(1) : '—'}
              </p>
              <p className="text-xs mt-1.5" style={{ color: 'var(--color-neutral-700)' }}>{estaciones.length} estaciones activas</p>
            </div>
            <div className="pr-6 py-6 border-r border-(--color-neutral-300)">
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-2" style={{ color: 'var(--color-neutral-700)' }}>
                Estación más crítica
              </p>
              <p
                className="font-heading font-extrabold text-4xl tracking-[-0.03em]"
                style={{ color: masCritica ? obtenerConfigEstado(masCritica.estado_fwi).tono : undefined }}
              >
                {masCritica ? f1(masCritica.fwi) : '—'}
              </p>
              <p className="text-xs mt-1.5" style={{ color: 'var(--color-neutral-700)' }}>
                {masCritica ? `${masCritica.nombre} · ${obtenerConfigEstado(masCritica.estado_fwi).etiqueta}` : 'sin datos'}
              </p>
            </div>
          </div>

          <section className="border-b-2 border-(--color-divider) py-6">
            <h2 className="font-heading font-extrabold text-lg tracking-[-0.01em] mb-4">Estaciones</h2>
            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
              {estaciones.map(estacion => (
                <TarjetaEstacion
                  key={estacion.id}
                  estacion={estacion}
                  altitud={config[estacion.id]?.altitud}
                />
              ))}
            </div>
          </section>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2px]" style={{ background: 'var(--color-divider)' }}>
        <div className="order-2 lg:order-1 py-6 lg:pr-6" style={{ background: 'var(--color-bg)' }}>
          <MapaEstaciones />
        </div>
        <div className="order-1 lg:order-2 py-6 lg:pl-6" style={{ background: 'var(--color-bg)' }}>
          <TablaPrecipitaciones />
        </div>
      </div>
    </div>
  )
}
