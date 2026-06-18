import { useState } from 'react'
import { useEstaciones } from '../hooks/useEstaciones'
import { useEstacion } from '../hooks/useEstacion'
import { InsigniaFwi } from '../components/ui/InsigniaFwi'
import { Cargando } from '../components/ui/Cargando'
import { MensajeError } from '../components/ui/MensajeError'
import { f1, f2 } from '../utils/formato'
import { obtenerEtiquetaFuente } from '../utils/fuente'

type Formateador = (valor: string | number | undefined | null) => string

interface CampoComparar {
  etiqueta: string
  clave: string
  unidad: string
  formato?: Formateador
}

const CAMPOS: CampoComparar[] = [
  { etiqueta: 'Temperatura', clave: 'Temp', unidad: '°C' },
  { etiqueta: 'Humedad', clave: 'HR', unidad: '%' },
  { etiqueta: 'Viento', clave: 'WS', unidad: 'km/h' },
  { etiqueta: 'Precipitaciones', clave: 'PPT', unidad: 'mm', formato: f2 },
  { etiqueta: 'FFMC', clave: 'FFMC', unidad: '' },
  { etiqueta: 'DMC', clave: 'DMC', unidad: '' },
  { etiqueta: 'DC', clave: 'DC', unidad: '' },
  { etiqueta: 'ISI', clave: 'ISI', unidad: '' },
  { etiqueta: 'BUI', clave: 'BUI', unidad: '' },
  { etiqueta: 'FWI', clave: 'FWI', unidad: '', formato: f1 },
]

function FilaEstacion({ id, onQuitar }: { id: string; onQuitar: () => void }) {
  const { estacion, cargando, error } = useEstacion(id)

  if (cargando) return (
    <td colSpan={CAMPOS.length + 1} className="py-4 pl-6 text-center">
      <Cargando mensaje="Cargando..." />
    </td>
  )

  if (error || !estacion) return (
    <td colSpan={CAMPOS.length + 1} className="py-4 pl-6">
      <MensajeError mensaje={error ?? 'Sin datos'} />
    </td>
  )

  return (
    <>
      <td className="py-3 pr-4 pl-6 min-w-40">
        <div className="font-semibold text-gray-800 text-sm">{estacion.nombre}</div>
        <InsigniaFwi estado={estacion['Estado FWI']} tamaño="sm" />
        <div className="text-xs text-gray-400 mt-1">{estacion.Date} · {estacion.Hora}</div>
        <button onClick={onQuitar} className="text-xs text-red-400 hover:underline mt-1">
          Quitar
        </button>
      </td>
      {CAMPOS.map(({ clave, unidad, formato }) => {
        const valor = estacion[clave as keyof typeof estacion]
        return (
          <td key={clave} className="py-3 pr-6 text-sm text-gray-700 font-medium">
            {formato ? formato(valor) : valor}{unidad}
          </td>
        )
      })}
    </>
  )
}

export function Comparar() {
  const { estaciones, cargando, error } = useEstaciones()
  const [seleccionadas, setSeleccionadas] = useState<string[]>([])

  const agregar = (id: string) => {
    if (!seleccionadas.includes(id)) setSeleccionadas((prev) => [...prev, id])
  }

  const quitar = (id: string) => setSeleccionadas((prev) => prev.filter((s) => s !== id))

  if (cargando) return <Cargando mensaje="Cargando estaciones..." />
  if (error) return <MensajeError mensaje={error} />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Comparar estaciones</h1>
        <p className="text-sm text-gray-500 mt-1">
          Seleccioná las estaciones que querés comparar.
        </p>
      </div>

      <div className="mb-6">
        <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Agregar estación</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {estaciones.map((est) => {
            const seleccionada = seleccionadas.includes(est.id)
            return (
              <button
                key={est.id}
                onClick={() => agregar(est.id)}
                disabled={seleccionada}
                className={`relative overflow-hidden text-left bg-white rounded-xl border border-gray-200 pl-5 p-4 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  seleccionada
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer hover:shadow-md hover:border-emerald-300'
                }`}
              >
                <span className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-emerald-500 via-amber-500 to-red-500" />
                <span className="absolute -right-1 -top-2 text-2xl font-black text-gray-100 select-none pointer-events-none tracking-tight whitespace-nowrap">
                  {obtenerEtiquetaFuente(est.api)}
                </span>
                <h3 className="relative font-semibold text-gray-900 text-base leading-tight truncate pr-4">
                  {est.nombre}
                </h3>
                <p className="relative text-xs text-gray-400 mt-0.5">{est.id}</p>
              </button>
            )
          })}
        </div>
      </div>

      {seleccionadas.length === 0 ? (
        <p className="text-gray-400 text-center py-16">
          Seleccioná al menos una estación para comparar.
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                <th className="py-3 pr-4 pl-6 text-left">Estación</th>
                {CAMPOS.map(({ etiqueta }) => (
                  <th key={etiqueta} className="py-3 pr-6 text-left">
                    {etiqueta}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seleccionadas.map((id) => (
                <tr key={id} className="border-b border-gray-50">
                  <FilaEstacion id={id} onQuitar={() => quitar(id)} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
