import { useParams, useNavigate } from 'react-router-dom'
import { useEstacion } from '../hooks/useEstacion'
import { InsigniaFwi } from '../components/ui/InsigniaFwi'
import { Cargando } from '../components/ui/Cargando'
import { MensajeError } from '../components/ui/MensajeError'
import { TablaHistorial } from '../components/ui/TablaHistorial'
import { GraficosAnuales } from '../components/graficos/GraficosAnuales'
import { f1, f2 } from '../utils/formato'

export function DetalleEstacion() {
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
          {estacion.Date} · {estacion.Hora} · {estacion.api}
        </span>
      </div>

      {/* Contenido principal + gráficos en el costado */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          {/* Paneles de datos actuales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
                Condiciones meteorológicas
              </h2>
              <dl className="grid grid-cols-2 gap-4">
                {[
                  { etiqueta: 'Temperatura',       valor: `${f1(estacion.Temp)} °C` },
                  { etiqueta: 'Humedad relativa',   valor: `${f1(estacion.HR)} %` },
                  { etiqueta: 'Velocidad viento',   valor: `${f1(estacion.WS)} km/h` },
                  { etiqueta: 'Viento 10m',         valor: `${f1(estacion['W 10'])} km/h` },
                  { etiqueta: 'Dirección',          valor: estacion.WD },
                  { etiqueta: 'Precipitaciones',    valor: `${f2(estacion.PPT)} mm` },
                  { etiqueta: 'Acumulado anual',    valor: `${f2(estacion.Acum)} mm` },
                ].map(({ etiqueta, valor }) => (
                  <div key={etiqueta}>
                    <dt className="text-xs text-gray-400">{etiqueta}</dt>
                    <dd className="text-lg font-semibold text-gray-800">{valor}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">
                Índices FWI
              </h2>
              <dl className="grid grid-cols-2 gap-4">
                {[
                  { etiqueta: 'FFMC', valor: estacion.FFMC },
                  { etiqueta: 'DMC',  valor: estacion.DMC },
                  { etiqueta: 'DC',   valor: estacion.DC },
                  { etiqueta: 'ISI',  valor: estacion.ISI },
                  { etiqueta: 'BUI',  valor: estacion.BUI },
                ].map(({ etiqueta, valor }) => (
                  <div key={etiqueta}>
                    <dt className="text-xs text-gray-400">{etiqueta}</dt>
                    <dd className="text-lg font-semibold text-gray-800">{valor}</dd>
                  </div>
                ))}
                <div>
                  <dt className="text-xs text-gray-400">FWI</dt>
                  <dd className="text-3xl font-bold text-blue-700">{f1(estacion.FWI)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Historial con exportación */}
          <TablaHistorial id={id ?? ''} nombre={estacion.nombre} />
        </div>

        {/* Gráficos anuales interanuales, ubicados al costado en pantallas grandes */}
        <div className="xl:col-span-1 xl:sticky xl:top-20">
          <GraficosAnuales id={id ?? ''} />
        </div>
      </div>
    </div>
  )
}
