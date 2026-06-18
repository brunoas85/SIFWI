import type {
  ResumenEstacion,
  DetalleEstacion,
  RespuestaHistorial,
  RespuestaHistorialRango,
  ConfiguracionEstacion,
  VistaFwiItem,
  VistaMeteorItem,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://181.114.143.184:4102/api'

async function get<T>(ruta: string): Promise<T> {
  const respuesta = await fetch(`${BASE_URL}${ruta}`)
  if (!respuesta.ok) throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
  return respuesta.json()
}

export const obtenerEstaciones = () =>
  get<ResumenEstacion[]>('/estaciones')

export const obtenerConfigEstaciones = () =>
  get<Record<string, ConfiguracionEstacion>>('/estaciones/config')

export const obtenerEstacion = (id: string) =>
  get<DetalleEstacion>(`/estacion/${id}`)

export const obtenerHistorial = (id: string) =>
  get<RespuestaHistorial>(`/estacion/${id}/historial`)

export const obtenerHistorialRango = (id: string, fechaInicio: string, fechaFin: string) =>
  get<RespuestaHistorialRango>(
    `/estacion/${id}/historial/rango?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
  )

export const obtenerVistaFwi = () =>
  get<{ status: string; fecha_reporte: { fecha: string; hora: string }; data: VistaFwiItem[] }>(
    '/vista_fwi'
  )

export const obtenerVistaDatosMeteor = () =>
  get<{ status: string; fecha_reporte: { fecha: string; hora: string }; data: VistaMeteorItem[] }>(
    '/vista_datos_meteorologicos'
  )
