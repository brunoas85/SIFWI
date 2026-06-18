import { useNavigate } from 'react-router-dom'
import type { ResumenEstacion } from '../../types'
import { obtenerEtiquetaFuente } from '../../utils/fuente'

interface Props {
  estacion: ResumenEstacion
  altitud?: string
}

export function TarjetaEstacion({ estacion, altitud }: Props) {
  const navigate = useNavigate()
  const fuente = obtenerEtiquetaFuente(estacion.api)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/estacion/${estacion.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/estacion/${estacion.id}`)}
      className="relative overflow-hidden bg-white rounded-xl border border-gray-200 pl-5 p-4 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
    >
      <span className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-emerald-500 via-amber-500 to-red-500" />

      {/* Fuente de datos como marca de agua de fondo */}
      <span className="absolute -right-1 -top-2 text-2xl font-black text-gray-100 select-none pointer-events-none tracking-tight whitespace-nowrap">
        {fuente}
      </span>

      <h2 className="relative font-semibold text-gray-900 text-base leading-tight truncate pr-4">
        {estacion.nombre}
      </h2>
      <p className="relative text-xs text-gray-400 mt-0.5">{estacion.id}</p>

      {altitud && (
        <p className="relative text-xs text-gray-400 mt-2">
          {altitud} m s.n.m.
        </p>
      )}
    </div>
  )
}
