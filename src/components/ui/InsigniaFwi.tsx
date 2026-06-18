import { obtenerConfigEstado } from '../../utils/fwi'

interface Props {
  estado: string
  tamaño?: 'sm' | 'md' | 'lg'
}

const TAMAÑOS = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
}

export function InsigniaFwi({ estado, tamaño = 'md' }: Props) {
  const config = obtenerConfigEstado(estado)
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border whitespace-nowrap ${config.clases} ${TAMAÑOS[tamaño]}`}
    >
      {config.etiqueta}
    </span>
  )
}
