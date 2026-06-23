import { GraficosSeriesAnuales, type ConfigGrafico } from './GraficosSeriesAnuales'
import type { RegistroHistorial } from '../../types'

function getterIndice(campo: 'FFMC' | 'DMC' | 'DC' | 'BUI' | 'FWI') {
  return (r: RegistroHistorial) => {
    const v = parseFloat(String(r[campo]))
    return isNaN(v) ? null : v
  }
}

const GRAFICOS: ConfigGrafico[] = [
  { titulo: 'FFMC', unidad: '', getter: getterIndice('FFMC') },
  { titulo: 'DMC', unidad: '', getter: getterIndice('DMC') },
  { titulo: 'DC', unidad: '', getter: getterIndice('DC') },
  { titulo: 'BUI', unidad: '', getter: getterIndice('BUI') },
  { titulo: 'FWI', unidad: '', getter: getterIndice('FWI') },
]

interface Props {
  id: string
}

export function GraficosIndicesFwi({ id }: Props) {
  return <GraficosSeriesAnuales id={id} titulo="Evolución de índices FWI" graficos={GRAFICOS} />
}
