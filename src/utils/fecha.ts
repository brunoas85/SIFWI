interface FechaPartes {
  anio: number
  mes: number
  dia: number
}

function parsearFecha(fecha: string): FechaPartes | null {
  if (!fecha) return null
  // La API devuelve las fechas como YYYYMMDD sin separadores
  if (/^\d{8}$/.test(fecha)) {
    return {
      anio: parseInt(fecha.slice(0, 4), 10),
      mes: parseInt(fecha.slice(4, 6), 10) - 1,
      dia: parseInt(fecha.slice(6, 8), 10),
    }
  }
  const partes = fecha.split(/[-/]/)
  if (partes.length >= 3 && partes[0].length === 4) {
    // YYYY-MM-DD o YYYY/MM/DD
    return { anio: parseInt(partes[0], 10), mes: parseInt(partes[1], 10) - 1, dia: parseInt(partes[2], 10) }
  }
  if (partes.length >= 3 && partes[2].length === 4) {
    // DD-MM-YYYY o DD/MM/YYYY
    return { anio: parseInt(partes[2], 10), mes: parseInt(partes[1], 10) - 1, dia: parseInt(partes[0], 10) }
  }
  return null
}

export function formatearFecha(fecha: string): string {
  const p = parsearFecha(fecha)
  if (!p) return fecha
  const dd = String(p.dia).padStart(2, '0')
  const mm = String(p.mes + 1).padStart(2, '0')
  return `${dd}/${mm}/${p.anio}`
}

export function claveDiaMes(fecha: string): string | null {
  const p = parsearFecha(fecha)
  if (!p || p.mes < 0 || p.mes > 11 || p.dia < 1) return null
  return `${String(p.mes + 1).padStart(2, '0')}-${String(p.dia).padStart(2, '0')}`
}
