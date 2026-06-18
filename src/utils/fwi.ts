interface ConfigEstado {
  clases: string
  etiqueta: string
}

const CONFIG_ESTADO_FWI: Record<string, ConfigEstado> = {
  BAJO:      { clases: 'bg-green-100 text-green-800 border-green-200',   etiqueta: 'Bajo' },
  MODERADO:  { clases: 'bg-yellow-100 text-yellow-800 border-yellow-200', etiqueta: 'Moderado' },
  ALTO:      { clases: 'bg-orange-100 text-orange-800 border-orange-200', etiqueta: 'Alto' },
  'MUY ALTO':{ clases: 'bg-red-100 text-red-800 border-red-200',          etiqueta: 'Muy Alto' },
  SEVERO:    { clases: 'bg-red-200 text-red-900 border-red-300',          etiqueta: 'Severo' },
  EXTREMO:   { clases: 'bg-purple-200 text-purple-900 border-purple-300', etiqueta: 'Extremo' },
}

const DEFAULT_CONFIG: ConfigEstado = {
  clases: 'bg-gray-100 text-gray-600 border-gray-200',
  etiqueta: 'Sin datos',
}

export function obtenerConfigEstado(estado: string): ConfigEstado {
  return CONFIG_ESTADO_FWI[estado?.toUpperCase()] ?? DEFAULT_CONFIG
}
