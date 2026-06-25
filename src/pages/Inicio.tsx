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
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Estaciones meteorológicas</h2>
        <p className="text-sm text-gray-500 mt-1">
          {estaciones.length} estaciones · último registro disponible
        </p>
      </div>

      {estaciones.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No hay estaciones disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {estaciones.map(estacion => (
            <TarjetaEstacion
              key={estacion.id}
              estacion={estacion}
              altitud={config[estacion.id]?.altitud}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <MapaEstaciones />
        <TablaPrecipitaciones />
      </div>
    </div>
  )
}
