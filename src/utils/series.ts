import type { RegistroHistorial } from '../types'

export function extraerMes(fecha: string): number {
  if (!fecha) return -1
  // La API devuelve las fechas como YYYYMMDD sin separadores
  if (/^\d{8}$/.test(fecha)) {
    return parseInt(fecha.slice(4, 6), 10) - 1
  }
  // Soporta YYYY-MM-DD y YYYY/MM/DD
  const partes = fecha.split(/[-/]/)
  if (partes.length >= 3 && partes[0].length === 4) {
    return parseInt(partes[1], 10) - 1
  }
  // DD/MM/YYYY o DD-MM-YYYY
  if (partes.length >= 3 && partes[2].length === 4) {
    return parseInt(partes[1], 10) - 1
  }
  return -1
}

export function agregarPorMes(
  datos: RegistroHistorial[],
  getter: (r: RegistroHistorial) => number | null,
  esSuma = false
): (number | null)[] {
  const porMes: number[][] = Array.from({ length: 12 }, () => [])
  datos.forEach(r => {
    const mes = extraerMes(r.Date)
    if (mes < 0 || mes > 11) return
    const val = getter(r)
    if (val !== null) porMes[mes].push(val)
  })
  return porMes.map(vals => {
    if (vals.length === 0) return null
    const suma = vals.reduce((a, b) => a + b, 0)
    return esSuma ? suma : suma / vals.length
  })
}
