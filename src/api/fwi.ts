import type {
  ResumenEstacion,
  DetalleEstacion,
  RespuestaHistorial,
  RespuestaHistorialRango,
  ConfiguracionEstacion,
  VistaFwiItem,
  VistaMeteorItem,
  RespuestaLogin,
} from '../types'
import { CLAVE_TOKEN } from '../utils/sesion'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://181.114.143.184:4102/api'

// TEMPORAL: credenciales de prueba hasta que el backend tenga POST /api/auth/login
const USUARIO_TEMPORAL = 'admin'
const CONTRASENA_TEMPORAL = 'sifwi2026'

let manejador401: (() => void) | null = null

export function registrarManejador401(fn: () => void) {
  manejador401 = fn
}

function cabecerasAuth(): HeadersInit {
  const token = localStorage.getItem(CLAVE_TOKEN)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function manejarRespuesta(respuesta: Response) {
  if (respuesta.status === 401) {
    localStorage.removeItem(CLAVE_TOKEN)
    manejador401?.()
  }
  if (!respuesta.ok) throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
}

async function get<T>(ruta: string): Promise<T> {
  const respuesta = await fetch(`${BASE_URL}${ruta}`, { headers: cabecerasAuth() })
  manejarRespuesta(respuesta)
  return respuesta.json()
}

export async function iniciarSesion(usuario: string, contrasena: string): Promise<RespuestaLogin> {
  if (usuario === USUARIO_TEMPORAL && contrasena === CONTRASENA_TEMPORAL) {
    return { status: 'success', token: 'token-temporal-sifwi', usuario }
  }
  throw new Error('Usuario o contraseña incorrectos')
}

export const obtenerEstaciones = () =>
  get<ResumenEstacion[]>('/estaciones')

export const obtenerConfigEstaciones = () =>
  get<Record<string, ConfiguracionEstacion>>('/estaciones/config')

export const obtenerEstacion = (id: string) =>
  get<DetalleEstacion>(`/estacion/${id}`)

export const obtenerHistorial = (id: string) =>
  get<RespuestaHistorial>(`/estacion/${id}/historial`)

export const obtenerHistorialRango = async (
  id: string,
  fechaInicio: string,
  fechaFin: string
): Promise<RespuestaHistorialRango> => {
  const respuesta = await fetch(
    `${BASE_URL}/estacion/${id}/historial/rango?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
    { headers: cabecerasAuth() }
  )
  // La API responde 404 cuando no hay registros en el rango (no es un error real)
  if (respuesta.status === 404) {
    return {
      status: 'success',
      estacion_id: id,
      nombre_estacion: '',
      total_registros: 0,
      primer_registro: '',
      ultimo_registro: '',
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      datos: [],
    }
  }
  manejarRespuesta(respuesta)
  return respuesta.json()
}

export const obtenerVistaFwi = () =>
  get<{ status: string; fecha_reporte: { fecha: string; hora: string }; data: VistaFwiItem[] }>(
    '/vista_fwi'
  )

export const obtenerVistaDatosMeteor = () =>
  get<{ status: string; fecha_reporte: { fecha: string; hora: string }; data: VistaMeteorItem[] }>(
    '/vista_datos_meteorologicos'
  )
