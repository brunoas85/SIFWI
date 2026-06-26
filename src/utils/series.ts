import type { RegistroHistorial } from '../types'
import { claveDiaMes } from './fecha'

// Claves "MM-DD" de los 366 días del año (incluye 29/02 para años bisiestos)
const DIAS_POR_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
export const DIAS_DEL_ANIO: string[] = DIAS_POR_MES.flatMap((dias, mes) =>
  Array.from({ length: dias }, (_, i) => `${String(mes + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`)
)

export const INICIOS_MES: string[] = Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}-01`)

export function agregarPorDia(
  datos: RegistroHistorial[],
  getter: (r: RegistroHistorial) => number | null,
  esSuma = false
): Record<string, number | null> {
  const porDia: Record<string, number[]> = {}
  datos.forEach(r => {
    const clave = claveDiaMes(r.Date)
    if (!clave) return
    const val = getter(r)
    if (val === null) return
    if (!porDia[clave]) porDia[clave] = []
    porDia[clave].push(val)
  })
  const resultado: Record<string, number | null> = {}
  Object.entries(porDia).forEach(([clave, vals]) => {
    const suma = vals.reduce((a, b) => a + b, 0)
    resultado[clave] = esSuma ? suma : suma / vals.length
  })
  return resultado
}

// Redondea hacia arriba a un número "lindo" para usar como máximo de eje Y
export function redondearMax(valor: number): number {
  if (valor <= 0) return 10
  const pasos = [1, 2, 5, 10, 20, 25, 50, 100, 150, 200, 250, 500, 750, 1000]
  for (const paso of pasos) {
    if (valor <= paso) return paso
  }
  return Math.ceil(valor / 500) * 500
}
