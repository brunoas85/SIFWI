import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useNavigate } from 'react-router-dom'
import { useEstaciones } from '../../hooks/useEstaciones'
import { useConfigEstaciones } from '../../hooks/useConfigEstaciones'
import { InsigniaFwi } from './InsigniaFwi'
import { Cargando } from './Cargando'
import { formatearFecha } from '../../utils/fecha'
import type { ResumenEstacion } from '../../types'

interface Marcador {
  id: string
  nombre: string
  lat: number
  lng: number
  api: string
  resumen: ResumenEstacion | null
}

const COLOR_ESTADO: Record<string, string> = {
  BAJO:      '#16a34a',
  MODERADO:  '#ca8a04',
  ALTO:      '#ea580c',
  'MUY ALTO':'#dc2626',
  SEVERO:    '#991b1b',
  EXTREMO:   '#7c3aed',
}

function urlWunderground(idEstacion: string): string {
  const hoy = new Date().toISOString().slice(0, 10)
  return `https://www.wunderground.com/dashboard/pws/${idEstacion}/table/${hoy}/${hoy}/daily`
}

function crearIcono(estadoFwi: string, fwi: string): L.DivIcon {
  const color = COLOR_ESTADO[estadoFwi?.toUpperCase()] ?? '#6b7280'
  const valor = isNaN(parseFloat(fwi)) ? '?' : Math.round(parseFloat(fwi)).toString()
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${color};color:#fff;border-radius:50%;
      width:40px;height:40px;display:flex;align-items:center;
      justify-content:center;font-weight:700;font-size:12px;
      border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);
      cursor:pointer;
    ">${valor}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  })
}

export function MapaEstaciones() {
  const navigate = useNavigate()
  const { estaciones, cargando: cargandoEst } = useEstaciones()
  const { config, cargando: cargandoCfg } = useConfigEstaciones()

  const marcadores = useMemo(() => {
    return Object.entries(config)
      .filter(([, cfg]) => cfg.activa)
      .map(([id, cfg]): Marcador | null => {
        const lat = parseFloat(cfg.latitud)
        const lng = parseFloat(cfg.longitud)
        if (isNaN(lat) || isNaN(lng)) return null
        return {
          id,
          nombre: cfg.nombre,
          lat,
          lng,
          api: cfg.api,
          resumen: estaciones.find(e => e.id === id) ?? null,
        }
      })
      .filter((m): m is Marcador => m !== null)
  }, [config, estaciones])

  const bounds = useMemo((): L.LatLngBoundsExpression | undefined => {
    if (marcadores.length === 0) return undefined
    return marcadores.map(m => [m.lat, m.lng]) as L.LatLngBoundsExpression
  }, [marcadores])

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white h-full flex flex-col">
      <div className="px-4 py-2.5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 via-amber-50 to-orange-50 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
          Mapa interactivo
        </p>
      </div>

      {cargandoEst || cargandoCfg ? (
        <div style={{ height: 440 }}>
          <Cargando mensaje="Cargando mapa..." />
        </div>
      ) : marcadores.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: 440 }}>
          <p className="text-sm text-gray-400 text-center px-6">
            El mapa interactivo no está disponible: la API no informó coordenadas de las estaciones.
          </p>
        </div>
      ) : (
        <div style={{ height: 440 }}>
          <MapContainer
            bounds={bounds}
            boundsOptions={{ padding: [40, 40] }}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {marcadores.map(m => (
              <Marker
                key={m.id}
                position={[m.lat, m.lng]}
                icon={crearIcono(m.resumen?.estado_fwi ?? '', m.resumen?.fwi ?? '')}
              >
                <Popup minWidth={200}>
                  <div className="p-1">
                    <p className="font-semibold text-gray-900 text-sm mb-1">{m.nombre}</p>
                    <p className="text-xs text-gray-400 mb-2">{m.id} · {m.api}</p>
                    {m.resumen && (
                      <>
                        <div className="mb-2">
                          <InsigniaFwi estado={m.resumen.estado_fwi} tamaño="sm" />
                        </div>
                        <div className="text-sm space-y-0.5 text-gray-700 mb-3">
                          <div>FWI: <span className="font-bold text-blue-700">{m.resumen.fwi}</span></div>
                          <div>Temp: {m.resumen.temperatura}°C · HR: {m.resumen.humedad}%</div>
                          <div>Viento: {m.resumen.viento} km/h</div>
                          <div className="text-xs text-gray-400">{formatearFecha(m.resumen.fecha)} {m.resumen.hora}</div>
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/estacion/${m.id}`)}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        Ver detalle →
                      </button>
                      {m.api?.toUpperCase() === 'WUNDERGROUND' && (
                        <a
                          href={urlWunderground(m.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-sky-600 hover:underline font-medium"
                        >
                          Wunderground ↗
                        </a>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  )
}
