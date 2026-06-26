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
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
        Historial
      </h2>

      {/* Controles de búsqueda */}
      <div className="flex flex-wrap gap-3 items-end mb-5">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Desde (YYYYMMDD)</label>
          <input
            type="text"
            value={fechaInicio}
            onChange={e => { setFechaInicio(e.target.value); setBuscar(false) }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Hasta (YYYYMMDD)</label>
          <input
            type="text"
            value={fechaFin}
            onChange={e => { setFechaFin(e.target.value); setBuscar(false) }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={() => setBuscar(true)}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Buscar
        </button>

        {datos.length > 0 && (
          <div className="flex gap-2 ml-auto">
            <a
              href={`/api/estacion/${id}/descargar`}
              download
              className="flex items-center gap-1.5 bg-emerald-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              ↓ CSV
            </a>
            <button
              onClick={() => exportarExcel(datos, nombreArchivo)}
              className="flex items-center gap-1.5 bg-violet-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-violet-700 transition-colors"
            >
              ↓ Excel
            </button>
          </div>
        )}
      </div>

      {cargando && <Cargando mensaje="Cargando historial..." />}
      {error && <MensajeError mensaje={error} />}

      {!cargando && buscar && !error && datos.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">
          No hay datos para el rango seleccionado.
        </p>
      )}

      {datos.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-400 uppercase">
                  <th className="pb-2 pr-4">Fecha</th>
                  <th className="pb-2 pr-4">Hora</th>
                  <th className="pb-2 pr-4">Temp °C</th>
                  <th className="pb-2 pr-4">HR %</th>
                  <th className="pb-2 pr-4">Viento 10m</th>
                  <th className="pb-2 pr-4">PPT mm</th>
                  <th className="pb-2 pr-4">Acum mm</th>
                  <th className="pb-2 pr-4">FFMC</th>
                  <th className="pb-2 pr-4">DMC</th>
                  <th className="pb-2 pr-4">DC</th>
                  <th className="pb-2 pr-4">ISI</th>
                  <th className="pb-2 pr-4">BUI</th>
                  <th className="pb-2 pr-4">FWI</th>
                  <th className="pb-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-500">{formatearFecha(r.Date)}</td>
                    <td className="py-2 pr-4 text-gray-500">{r.Hora}</td>
                    <td className="py-2 pr-4">{f1(r.Temp)}</td>
                    <td className="py-2 pr-4">{f1(r.HR)}</td>
                    <td className="py-2 pr-4">{f1(r['W 10'])}</td>
                    <td className="py-2 pr-4">{f2(r.PPT)}</td>
                    <td className="py-2 pr-4">{f2(r.Acum)}</td>
                    <td className="py-2 pr-4">{r.FFMC}</td>
                    <td className="py-2 pr-4">{r.DMC}</td>
                    <td className="py-2 pr-4">{r.DC}</td>
                    <td className="py-2 pr-4">{r.ISI}</td>
                    <td className="py-2 pr-4">{r.BUI}</td>
                    <td className="py-2 pr-4 font-semibold text-blue-700">{f1(r.FWI)}</td>
                    <td className="py-2">
                      <InsigniaFwi estado={r['Estado FWI']} tamaño="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">{datos.length} registros</p>
        </>
      )}
    </div>
  )
}
