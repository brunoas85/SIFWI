import { useState } from 'react'
import { useEstaciones } from '../hooks/useEstaciones'
import { useEstacion } from '../hooks/useEstacion'
import { InsigniaFwi } from '../components/ui/InsigniaFwi'
import { Cargando } from '../components/ui/Cargando'
import { MensajeError } from '../components/ui/MensajeError'
import { f1, f2 } from '../utils/formato'
import { formatearFecha } from '../utils/fecha'
import { obtenerConfigEstado } from '../utils/fwi'

type Formateador = (valor: string | number | undefined | null) => string

interface CampoComparar {
  etiqueta: string
  clave: string
  unidad: string
  formato?: Formateador
}

const CAMPOS: CampoComparar[] = [
  { etiqueta: 'Temperatura', clave: 'Temp', unidad: '°C', formato: f2 },
  { etiqueta: 'Humedad', clave: 'HR', unidad: '%', formato: f2 },
  { etiqueta: 'Viento', clave: 'WS', unidad: 'km/h', formato: f2 },
  { etiqueta: 'Precipitaciones', clave: 'PPT', unidad: 'mm', formato: f2 },
  { etiqueta: 'FFMC', clave: 'FFMC', unidad: '', formato: f2 },
  { etiqueta: 'DMC', clave: 'DMC', unidad: '', formato: f2 },
  { etiqueta: 'DC', clave: 'DC', unidad: '', formato: f2 },
  { etiqueta: 'ISI', clave: 'ISI', unidad: '', formato: f2 },
  { etiqueta: 'BUI', clave: 'BUI', unidad: '', formato: f2 },
  { etiqueta: 'FWI', clave: 'FWI', unidad: '', formato: f1 },
]

function FilaEstacion({ id, onQuitar }: { id: string; onQuitar: () => void }) {
  const { estacion, cargando, error } = useEstacion(id)

  if (cargando) return (
    <td colSpan={CAMPOS.length + 1} className="text-center align-middle">
      <Cargando mensaje="Cargando..." />
    </td>
  )

  if (error || !estacion) return (
    <td colSpan={CAMPOS.length + 1} className="text-center align-middle">
      <MensajeError mensaje={error ?? 'Sin datos'} />
    </td>
  )

  return (
    <>
      <td className="min-w-40 sticky left-0 z-10 border-r border-(--color-divider) text-center align-middle" style={{ background: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center">
          <div className="font-semibold text-sm">{estacion.nombre}</div>
          <InsigniaFwi estado={estacion['Estado FWI']} tamaño="sm" />
          <div className="text-xs mt-1" style={{ color: 'var(--color-neutral-600)' }}>{formatearFecha(estacion.Date)} · {estacion.Hora}</div>
          <button onClick={onQuitar} className="btn btn-ghost text-xs mt-1 px-0">
            Quitar
          </button>
        </div>
      </td>
      {CAMPOS.map(({ clave, unidad, formato }) => {
        const valor = estacion[clave as keyof typeof estacion]
        return (
          <td key={clave} className="text-sm font-medium tabular-nums text-center align-middle">
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
      <header className="pb-4 mb-6 border-b-2 border-(--color-divider)">
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--color-neutral-700)' }}>
          Parque Nacional Lanín
        </p>
        <h1 className="font-heading font-extrabold text-3xl tracking-[-0.02em]">Comparar estaciones</h1>
      </header>

      <p className="text-sm mb-4" style={{ color: 'var(--color-neutral-700)' }}>
        Hasta cuatro estaciones en paralelo. Tocá una tarjeta de abajo para sumarla o quitarla.
      </p>

      {seleccionadas.length === 0 ? (
        <p className="text-center py-16" style={{ color: 'var(--color-neutral-500)' }}>
          Seleccioná al menos una estación para comparar.
        </p>
      ) : (
        <div className="overflow-x-auto border-2 border-(--color-divider) mb-8">
          <table className="table" style={{ whiteSpace: 'nowrap' }}>
            <thead>
              <tr>
                <th className="text-center align-middle sticky left-0 z-20 border-r border-(--color-divider)" style={{ background: 'var(--color-surface)' }}>
                  Estación
                </th>
                {CAMPOS.map(({ etiqueta }) => (
                  <th key={etiqueta} className="text-center align-middle">
                    {etiqueta}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seleccionadas.map((id) => (
                <tr key={id}>
                  <FilaEstacion id={id} onQuitar={() => quitar(id)} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-3" style={{ color: 'var(--color-neutral-700)' }}>
        Estaciones disponibles
      </p>
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
        {estaciones.map((est) => {
          const seleccionada = seleccionadas.includes(est.id)
          const config = obtenerConfigEstado(est.estado_fwi)
          return (
            <button
              key={est.id}
              onClick={() => (seleccionada ? quitar(est.id) : agregar(est.id))}
              className="text-left border-0 cursor-pointer flex items-baseline justify-between gap-3 px-4 py-3.5"
              style={{
                borderTop: `4px solid ${config.tono}`,
                borderRight: '1px solid var(--color-divider)',
                borderBottom: '1px solid var(--color-divider)',
                background: seleccionada ? 'var(--color-text)' : 'var(--color-bg)',
                color: seleccionada ? '#fff' : 'var(--color-text)',
              }}
            >
              <span className="min-w-0">
                <span className="block font-heading font-extrabold text-base tracking-[-0.01em] overflow-hidden text-ellipsis whitespace-nowrap">
                  {est.nombre}
                </span>
                <span className="block text-[11px] tracking-[0.08em] uppercase opacity-75">
                  {config.etiqueta}
                </span>
              </span>
              <span className="font-heading font-extrabold text-xl tabular-nums shrink-0">{f1(est.fwi)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
