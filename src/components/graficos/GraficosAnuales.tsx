import { GraficosSeriesAnuales, type ConfigGrafico } from './GraficosSeriesAnuales'

const GRAFICOS: ConfigGrafico[] = [
  {
    titulo: 'Temperatura',
    unidad: '°C',
    getter: r => {
      const v = parseFloat(String(r.Temp))
      return isNaN(v) ? null : v
    },
  },
  {
    titulo: 'Precipitaciones',
    unidad: 'mm',
    getter: r => {
      const v = parseFloat(String(r.PPT))
      return isNaN(v) ? null : v
    },
    esSuma: true,
  },
  {
    titulo: 'Humedad relativa',
    unidad: '%',
    getter: r => {
      const v = parseFloat(String(r.HR))
      return isNaN(v) ? null : v
    },
  },
]

interface Props {
  id: string
}

export function GraficosAnuales({ id }: Props) {
  return <GraficosSeriesAnuales id={id} titulo="Análisis anual" graficos={GRAFICOS} />
}
