const ETIQUETAS_FUENTE: Record<string, string> = {
  SMN: 'SMN',
  WUNDERGROUND: 'Weather Underground',
  WU: 'Weather Underground',
}

export function obtenerEtiquetaFuente(api: string | undefined): string {
  if (!api) return 'Desconocida'
  return ETIQUETAS_FUENTE[api.toUpperCase()] ?? api
}
