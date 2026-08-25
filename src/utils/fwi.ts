interface ConfigEstado {
  tono: string
  texto: string
  etiqueta: string
}

const CONFIG_ESTADO_FWI: Record<string, ConfigEstado> = {
  BAJO:      { tono: '#3f8f4a', texto: '#fff', etiqueta: 'Bajo' },
  MODERADO:  { tono: '#d6a800', texto: '#201e1d', etiqueta: 'Moderado' },
  ALTO:      { tono: '#e2740b', texto: '#fff', etiqueta: 'Alto' },
  'MUY ALTO':{ tono: '#ec3013', texto: '#fff', etiqueta: 'Muy Alto' },
  SEVERO:    { tono: '#9e1c0a', texto: '#fff', etiqueta: 'Severo' },
  EXTREMO:   { tono: '#4d170e', texto: '#fff', etiqueta: 'Extremo' },
}

const DEFAULT_CONFIG: ConfigEstado = {
  tono: '#9b9797',
  texto: '#fff',
  etiqueta: 'Sin datos',
}

export function obtenerConfigEstado(estado: string): ConfigEstado {
  return CONFIG_ESTADO_FWI[estado?.toUpperCase()] ?? DEFAULT_CONFIG
}
