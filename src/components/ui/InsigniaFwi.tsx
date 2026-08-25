import { obtenerConfigEstado } from '../../utils/fwi'

interface Props {
  estado: string
  tamaño?: 'sm' | 'md' | 'lg'
}

const TAMAÑOS = {
  sm: { swatch: 8, texto: 'text-[11px]' },
  md: { swatch: 10, texto: 'text-xs' },
  lg: { swatch: 12, texto: 'text-sm' },
}

export function InsigniaFwi({ estado, tamaño = 'md' }: Props) {
  const config = obtenerConfigEstado(estado)
  const t = TAMAÑOS[tamaño]
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide whitespace-nowrap ${t.texto}`}>
      <span
        style={{ width: t.swatch, height: t.swatch, background: config.tono, border: '1px solid var(--color-text)' }}
      />
      {config.etiqueta}
    </span>
  )
}
