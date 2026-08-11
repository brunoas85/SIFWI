import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVistaDatosMeteor } from '../hooks/useVistaDatosMeteor'
import { useOrdenEstacionesPnl } from '../hooks/useOrdenEstacionesPnl'
import { normalizarNombre } from '../utils/nombreEstacion'
import { Cargando } from '../components/ui/Cargando'
import { MensajeError } from '../components/ui/MensajeError'
import { f1, f2 } from '../utils/formato'
import { formatearFecha } from '../utils/fecha'
import type { VistaMeteorItem } from '../types'

interface FilaEstacion {
  nombre: string
  dato: VistaMeteorItem | null
}

function horaLocal(fecha: Date): string {
  return fecha.toTimeString().slice(0, 8)
}

export function VistaMeteorologica() {
  const navigate = useNavigate()
  const { datos, actualizadoEn, cargando, error, recargar } = useVistaDatosMeteor()
  const orden = useOrdenEstacionesPnl()

  // Mismo orden y mismas estaciones que la tabla de Precipitaciones anuales · Parque
  // Nacional Lanín: las que figuran en el Excel pero no tienen datos en vivo (ej.
  // Meliquina, sin estación configurada en el backend) igual aparecen, sin valores.
  const filas = useMemo((): FilaEstacion[] => {
    if (orden.length === 0) return datos.map(d => ({ nombre: d.estacion, dato: d }))

    const datosPorNombre = new Map(datos.map(d => [normalizarNombre(d.estacion), d]))
    const usados = new Set<string>()

    const ordenadas = orden.map(o => {
      const d = datosPorNombre.get(o.normalizado)
      if (d) usados.add(o.normalizado)
      return { nombre: d?.estacion ?? o.nombre, dato: d ?? null }
    })

    const extras = datos
      .filter(d => !usados.has(normalizarNombre(d.estacion)))
      .map(d => ({ nombre: d.estacion, dato: d }))

    return [...ordenadas, ...extras]
  }, [datos, orden])

  if (cargando) return <Cargando mensaje="Consultando datos meteorológicos en vivo..." />
  if (error) return <MensajeError mensaje={error} />

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:underline mb-5 block"
      >
        ← Volver
      </button>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Variables meteorológicas</h1>
        <div className="flex items-center gap-3 ml-auto">
          {actualizadoEn && (
            <span className="text-xs text-gray-400">
              Actualizado {formatearFecha(actualizadoEn.toISOString().slice(0, 10))} · {horaLocal(actualizadoEn)}
            </span>
          )}
          <button
            onClick={recargar}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            ↻ Actualizar
          </button>
        </div>
      </div>

      {filas.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No hay datos disponibles.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-400 uppercase bg-gray-50">
                  <th className="py-3 pl-5 pr-4">Estación</th>
                  <th className="py-3 pr-4">Hora</th>
                  <th className="py-3 pr-4">Temp °C</th>
                  <th className="py-3 pr-4">HR %</th>
                  <th className="py-3 pr-4">Viento km/h</th>
                  <th className="py-3 pr-4">Viento 10m</th>
                  <th className="py-3 pr-4">Dirección</th>
                  <th className="py-3 pr-4">Lluvia ayer mm</th>
                  <th className="py-3 pr-5">Acumulado mm</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(({ nombre, dato: d }) => (
                  <tr
                    key={d?.estacion_id ?? nombre}
                    onClick={d ? () => navigate(`/estacion/${d.estacion_id}`) : undefined}
                    className={`border-b border-gray-50 transition-colors ${
                      d ? 'hover:bg-blue-50/30 cursor-pointer' : 'text-gray-300'
                    }`}
                  >
                    <td className={`py-2.5 pl-5 pr-4 font-medium ${d ? 'text-gray-800' : 'text-gray-400'}`}>
                      {nombre}
                    </td>
                    {d ? (
                      <>
                        <td className="py-2.5 pr-4 text-gray-500">{d.hora}</td>
                        <td className="py-2.5 pr-4">{f1(d.temperatura)}</td>
                        <td className="py-2.5 pr-4">{f1(d.humedad)}</td>
                        <td className="py-2.5 pr-4">{f1(d.viento_kmh)}</td>
                        <td className="py-2.5 pr-4">{f1(d.viento_10m)}</td>
                        <td className="py-2.5 pr-4">{d.direccion}</td>
                        <td className="py-2.5 pr-4">{f2(d.lluvia_ayer)}</td>
                        <td className="py-2.5 pr-5">{f2(d.acumulado)}</td>
                      </>
                    ) : (
                      <td colSpan={8} className="py-2.5 pr-5 text-xs">Sin estación configurada en el backend</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 px-5 py-3">{filas.length} estaciones</p>
        </div>
      )}
    </div>
  )
}
