export interface ResumenEstacion {
  id: string
  nombre: string
  fecha: string
  hora: string
  estado_fwi: string
  fwi: string
  temperatura: string
  humedad: string
  viento: string
  ppt: string
  api: string
}

export interface DetalleEstacion {
  Date: string
  Hora: string
  Temp: string
  HR: string
  WS: string
  'W 10': string
  WD: string
  PPT: string
  Acum: string
  FFMC: string
  DMC: string
  DC: string
  ISI: string
  BUI: string
  FWI: string
  'Estado FWI': string
  nombre: string
  api: string
}

export interface RegistroHistorial {
  Date: string
  Hora: string
  Temp: string
  HR: string
  WS: string
  'W 10'?: string
  WD?: string
  PPT: string
  Acum?: string
  FFMC: string
  DMC: string
  DC: string
  ISI: string
  BUI: string
  FWI: string
  'Estado FWI': string
}

export interface RespuestaHistorial {
  status: string
  estacion_id: string
  nombre_estacion: string
  total_registros: number
  primer_registro: string
  ultimo_registro: string
  datos: RegistroHistorial[]
}

export interface RespuestaHistorialRango extends RespuestaHistorial {
  fecha_inicio: string
  fecha_fin: string
}

export interface ConfiguracionEstacion {
  nombre: string
  latitud: string
  longitud: string
  api: string
  calculo_viento: number
  precipitaciones: string
  activa: boolean
  altitud?: string
}

export interface VistaFwiItem {
  estacion: string
  estacion_id: string
  ffmc: number
  dmc: number
  dc: number
  isi: number
  bui: number
  fwi: number
  fecha: string
  hora: string
}

export interface VistaMeteorItem {
  estacion: string
  estacion_id: string
  temperatura: number
  humedad: number
  viento_kmh: number
  viento_10m: number
  direccion: string
  lluvia_ayer: number
  acumulado: number
  fecha: string
  hora: string
}
