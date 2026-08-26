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
import { obtenerConfigEstado } from '../../utils/fwi'
import type { ResumenEstacion } from '../../types'

interface Marcador {
  id: string
  nombre: string
  lat: number
  lng: number
  api: string
  resumen: ResumenEstacion | null
}

function urlWunderground(idEstacion: string): string {
  const hoy = new Date().toISOString().slice(0, 10)
  return `https://www.wunderground.com/dashboard/pws/${idEstacion}/table/${hoy}/${hoy}/daily`
}

function crearIcono(estadoFwi: string): L.DivIcon {
  const config = obtenerConfigEstado(estadoFwi)
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${config.tono};border:1.5px solid rgba(255,255,255,0.85);border-radius:50%;
      width:14px;height:14px;box-shadow:0 0 0 1px rgba(32,30,29,0.35);
      cursor:pointer;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -8],
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
    <div className="h-full flex flex-col">
      <h2 className="font-heading font-extrabold text-lg tracking-[-0.01em] mb-4">Mapa</h2>

      {cargandoEst || cargandoCfg ? (
        <div className="border-2 border-(--color-divider)" style={{ height: 420 }}>
          <Cargando mensaje="Cargando mapa..." />
        </div>
      ) : marcadores.length === 0 ? (
        <div className="flex items-center justify-center border-2 border-(--color-divider)" style={{ height: 420 }}>
          <p className="text-sm text-center px-6" style={{ color: 'var(--color-neutral-600)' }}>
            El mapa interactivo no está disponible: la API no informó coordenadas de las estaciones.
          </p>
        </div>
      ) : (
        <div className="border-2 border-(--color-divider)" style={{ height: 420 }}>
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
                icon={crearIcono(m.resumen?.estado_fwi ?? '')}
              >
                <Popup minWidth={200}>
                  <div className="p-1">
                    <p className="font-heading font-extrabold text-sm mb-1">{m.nombre}</p>
                    <p className="text-xs mb-2" style={{ color: 'var(--color-neutral-600)' }}>{m.id} · {m.api}</p>
                    {m.resumen && (
                      <>
                        <div className="mb-2">
                          <InsigniaFwi estado={m.resumen.estado_fwi} tamaño="sm" />
                        </div>
                        <div className="text-sm space-y-0.5 mb-3">
                          <div>FWI: <span className="font-heading font-extrabold">{m.resumen.fwi}</span></div>
                          <div>Temp: {m.resumen.temperatura}°C · HR: {m.resumen.humedad}%</div>
                          <div>Viento: {m.resumen.viento} km/h</div>
                          <div className="text-xs" style={{ color: 'var(--color-neutral-600)' }}>{formatearFecha(m.resumen.fecha)} {m.resumen.hora}</div>
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/estacion/${m.id}`)}
                        className="btn btn-ghost text-sm"
                      >
                        Ver detalle →
                      </button>
                      {m.api?.toUpperCase() === 'WUNDERGROUND' && (
                        <a
                          href={urlWunderground(m.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm"
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
