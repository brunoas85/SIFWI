import { Link } from 'react-router-dom'
import { useEstaciones } from '../hooks/useEstaciones'
import { useConfigEstaciones } from '../hooks/useConfigEstaciones'
import { TarjetaEstacion } from '../components/ui/TarjetaEstacion'
import { MapaEstaciones } from '../components/ui/MapaEstaciones'
import { TablaPrecipitaciones } from '../components/ui/TablaPrecipitaciones'
import { Cargando } from '../components/ui/Cargando'
import { MensajeError } from '../components/ui/MensajeError'

export function Inicio() {
  const { estaciones, cargando, error } = useEstaciones()
  const { config } = useConfigEstaciones()

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
