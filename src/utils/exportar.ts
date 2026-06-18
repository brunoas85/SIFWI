import * as XLSX from 'xlsx'
import type { RegistroHistorial } from '../types'
import { f1, f2 } from './formato'

export function exportarExcel(datos: RegistroHistorial[], nombreArchivo: string) {
  const filas = datos.map(r => ({
    'Fecha': r.Date,
    'Hora': r.Hora,
    'Temp (°C)': f1(r.Temp),
    'HR (%)': f1(r.HR),
    'Viento 10m (km/h)': f1(r['W 10']),
    'PPT (mm)': f2(r.PPT),
    'Acum (mm)': f2(r.Acum),
    'FFMC': r.FFMC,
    'DMC': r.DMC,
    'DC': r.DC,
    'ISI': r.ISI,
    'BUI': r.BUI,
    'FWI': f1(r.FWI),
    'Estado FWI': r['Estado FWI'],
  }))

  const ws = XLSX.utils.json_to_sheet(filas)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Historial')
  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`)
}
