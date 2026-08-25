import { useState } from 'react'
import { useHistorial } from '../../hooks/useHistorial'
import { InsigniaFwi } from './InsigniaFwi'
import { Cargando } from './Cargando'
import { MensajeError } from './MensajeError'
import { f1, f2 } from '../../utils/formato'
import { formatearFecha } from '../../utils/fecha'
import { exportarExcel } from '../../utils/exportar'

interface Props {
  id: string
  nombre: string
}

function hoyFormato() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

function hace30DiasFormato() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

function aIso(fechaYYYYMMDD: string): string {
  if (!/^\d{8}$/.test(fechaYYYYMMDD)) return ''
  return `${fechaYYYYMMDD.slice(0, 4)}-${fechaYYYYMMDD.slice(4, 6)}-${fechaYYYYMMDD.slice(6, 8)}`
}

function deIso(fechaIso: string): string {
  return fechaIso.replace(/-/g, '')
}

export function TablaHistorial({ id, nombre }: Props) {
  const [fechaInicio, setFechaInicio] = useState(hace30DiasFormato())
  const [fechaFin, setFechaFin] = useState(hoyFormato())
  const [buscar, setBuscar] = useState(false)

  const { datos, cargando, error } = useHistorial(
    buscar ? id : '',
    fechaInicio,
    fechaFin
  )

  const nombreArchivo = `historial_${nombre.replace(/\s+/g, '_')}_${id}`

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <h2 className="font-heading font-extrabold text-lg tracking-[-0.01em] mr-4 self-center">Historial</h2>
        <div className="field">
          <label htmlFor="desde">Desde</label>
          <input
            id="desde"
            type="date"
            value={aIso(fechaInicio)}
            onChange={e => { setFechaInicio(deIso(e.target.value)); setBuscar(false) }}
            className="input text-sm"
          />
        </div>
        <div className="field">
          <label htmlFor="hasta">Hasta</label>
          <input
            id="hasta"
            type="date"
            value={aIso(fechaFin)}
            onChange={e => { setFechaFin(deIso(e.target.value)); setBuscar(false) }}
            className="input text-sm"
          />
        </div>
        <button onClick={() => setBuscar(true)} className="btn btn-primary text-sm">
          Buscar
        </button>

        {datos.length > 0 && (
          <div className="flex gap-2 ml-auto">
            <a href={`/api/estacion/${id}/descargar`} download className="btn btn-secondary text-sm">
              CSV
            </a>
            <button onClick={() => exportarExcel(datos, nombreArchivo)} className="btn btn-secondary text-sm">
              Excel
            </button>
          </div>
        )}
      </div>

      {cargando && <Cargando mensaje="Cargando historial..." />}
      {error && <MensajeError mensaje={error} />}

      {!cargando && buscar && !error && datos.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: 'var(--color-neutral-500)' }}>
          No hay datos para el rango seleccionado.
        </p>
      )}

      {datos.length > 0 && (
        <>
          <div className="overflow-x-auto border-2 border-(--color-divider)">
            <table className="table" style={{ whiteSpace: 'nowrap' }}>
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 border-r border-(--color-divider)" style={{ background: 'var(--color-surface)' }}>Fecha</th>
                  <th>Hora</th>
                  <th className="text-right">Temp °C</th>
                  <th className="text-right">HR %</th>
                  <th className="text-right">Viento 10 m</th>
                  <th className="text-right">PPT mm</th>
                  <th className="text-right">Acum mm</th>
                  <th className="text-right">FFMC</th>
                  <th className="text-right">DMC</th>
                  <th className="text-right">DC</th>
                  <th className="text-right">ISI</th>
                  <th className="text-right">BUI</th>
                  <th className="text-right">FWI</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((r, i) => (
                  <tr key={i}>
                    <td className="sticky left-0 z-10 border-r border-(--color-divider)" style={{ background: 'var(--color-bg)', color: 'var(--color-neutral-700)' }}>{formatearFecha(r.Date)}</td>
                    <td style={{ color: 'var(--color-neutral-700)' }}>{r.Hora}</td>
                    <td className="text-right tabular-nums">{f1(r.Temp)}</td>
                    <td className="text-right tabular-nums">{f1(r.HR)}</td>
                    <td className="text-right tabular-nums">{f1(r['W 10'])}</td>
                    <td className="text-right tabular-nums">{f2(r.PPT)}</td>
                    <td className="text-right tabular-nums">{f2(r.Acum)}</td>
                    <td className="text-right tabular-nums">{r.FFMC}</td>
                    <td className="text-right tabular-nums">{r.DMC}</td>
                    <td className="text-right tabular-nums">{r.DC}</td>
                    <td className="text-right tabular-nums">{r.ISI}</td>
                    <td className="text-right tabular-nums">{r.BUI}</td>
                    <td className="text-right tabular-nums font-heading font-extrabold">{f1(r.FWI)}</td>
                    <td>
                      <InsigniaFwi estado={r['Estado FWI']} tamaño="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] tracking-[0.1em] uppercase mt-3" style={{ color: 'var(--color-neutral-700)' }}>
            {datos.length} registros
          </p>
        </>
      )}
    </div>
  )
}
