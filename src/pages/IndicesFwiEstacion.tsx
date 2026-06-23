import { useParams, useNavigate } from 'react-router-dom'
import { useEstacion } from '../hooks/useEstacion'
import { InsigniaFwi } from '../components/ui/InsigniaFwi'
import { Cargando } from '../components/ui/Cargando'
import { MensajeError } from '../components/ui/MensajeError'
import { GraficosIndicesFwi } from '../components/graficos/GraficosIndicesFwi'

export function IndicesFwiEstacion() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { estacion, cargando, error } = useEstacion(id ?? '')

  if (cargando) return <Cargando mensaje="Cargando datos de la estación..." />
  if (error || !estacion) return <MensajeError mensaje={error ?? 'Estación no encontrada'} />

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:underline mb-5 block"
      >
        ← Volver
      </button>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{estacion.nombre}</h1>
        <InsigniaFwi estado={estacion['Estado FWI']} tamaño="lg" />
        <span className="text-xs text-gray-400 ml-auto">
          Índices FWI · evolución histórica
        </span>
      </div>

      <GraficosIndicesFwi id={id ?? ''} />
    </div>
  )
}
