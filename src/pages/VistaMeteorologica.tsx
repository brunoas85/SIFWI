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
  // Nacional Lanín: las que figuran en el Excel pero no tienen datos en vivo
  // igual aparecen, sin valores.
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
      <button onClick={() => navigate(-1)} className="btn btn-ghost text-sm mb-4">
        ← Volver
      </button>

      <header className="flex flex-wrap items-baseline gap-3 pb-4 mb-6 border-b-2 border-(--color-divider)">
        <h1 className="font-heading font-extrabold text-3xl tracking-[-0.02em]">Ver variables meteorológicas actuales</h1>
        <div className="flex items-center gap-3 ml-auto">
          {actualizadoEn && (
            <span className="text-xs" style={{ color: 'var(--color-neutral-600)' }}>
              Actualizado {formatearFecha(actualizadoEn.toISOString().slice(0, 10))} · {horaLocal(actualizadoEn)}
            </span>
          )}
          <button onClick={recargar} className="btn btn-ghost text-sm">
            ↻ Actualizar
          </button>
        </div>
      </header>

      {filas.length === 0 ? (
        <p className="text-center py-16" style={{ color: 'var(--color-neutral-500)' }}>No hay datos disponibles.</p>
      ) : (
        <>
          <div className="overflow-x-auto border-2 border-(--color-divider)">
            <table className="table" style={{ whiteSpace: 'nowrap' }}>
              <thead>
                <tr>
                  <th className="text-center align-middle sticky left-0 z-20 border-r border-(--color-divider)" style={{ background: 'var(--color-surface)' }}>
                    Estación
                  </th>
                  <th className="text-center align-middle">Hora</th>
                  <th className="text-center align-middle">Temp °C</th>
                  <th className="text-center align-middle">HR %</th>
                  <th className="text-center align-middle">Viento km/h</th>
                  <th className="text-center align-middle">Viento 10 m</th>
                  <th className="text-center align-middle">Dirección</th>
                  <th className="text-center align-middle">Lluvia ayer mm</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(({ nombre, dato: d }) => (
                  <tr
                    key={d?.estacion_id ?? nombre}
                    onClick={d ? () => navigate(`/estacion/${d.estacion_id}`) : undefined}
                    style={{ cursor: d ? 'pointer' : undefined, color: d ? undefined : 'var(--color-neutral-400)' }}
                  >
                    <td
                      className="font-medium text-center align-middle sticky left-0 z-10 border-r border-(--color-divider)"
                      style={{ background: 'var(--color-bg)', color: d ? undefined : 'var(--color-neutral-400)' }}
                    >
                      {nombre}
                    </td>
                    {d ? (
                      <>
                        <td className="text-center align-middle" style={{ color: 'var(--color-neutral-700)' }}>{d.hora}</td>
                        <td className="text-center align-middle tabular-nums">{f1(d.temperatura)}</td>
                        <td className="text-center align-middle tabular-nums">{f1(d.humedad)}</td>
                        <td className="text-center align-middle tabular-nums">{f1(d.viento_kmh)}</td>
                        <td className="text-center align-middle tabular-nums">{f1(d.viento_10m)}</td>
                        <td className="text-center align-middle">{d.direccion}</td>
                        <td className="text-center align-middle tabular-nums">{f2(d.lluvia_ayer)}</td>
                      </>
                    ) : (
                      <td colSpan={7} className="text-center align-middle text-xs">Sin estación configurada en el backend</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] tracking-[0.1em] uppercase mt-3" style={{ color: 'var(--color-neutral-700)' }}>
            {filas.length} estaciones
          </p>
        </>
      )}
    </div>
  )
}
