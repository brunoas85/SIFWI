import { useNavigate } from 'react-router-dom'
import type { ResumenEstacion } from '../../types'
import { obtenerConfigEstado } from '../../utils/fwi'
import { f1 } from '../../utils/formato'

interface Props {
  estacion: ResumenEstacion
  altitud?: string
}

export function TarjetaEstacion({ estacion, altitud }: Props) {
  const navigate = useNavigate()
  const config = obtenerConfigEstado(estacion.estado_fwi)

  return (
    <button
      onClick={() => navigate(`/estacion/${estacion.id}`)}
      className="text-left border-0 cursor-pointer w-full px-4.5 pt-4 pb-4.5"
      style={{
        background: 'var(--color-bg)',
        borderTop: `4px solid ${config.tono}`,
        borderRight: '1px solid var(--color-divider)',
        borderBottom: '1px solid var(--color-divider)',
      }}
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--color-neutral-700)' }}>
          {config.etiqueta}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--color-neutral-600)' }}>{estacion.api}</span>
      </span>
      <span className="block mt-2.5 font-heading font-extrabold text-xl leading-tight tracking-[-0.015em] overflow-hidden text-ellipsis whitespace-nowrap">
        {estacion.nombre}
      </span>
      <span className="flex items-end justify-between mt-3">
        <span className="text-xs tabular-nums" style={{ color: 'var(--color-neutral-700)' }}>
          {altitud ? `${altitud} m · ` : ''}{estacion.id}
        </span>
        <span className="font-heading font-extrabold text-3xl leading-none tabular-nums">{f1(estacion.fwi)}</span>
      </span>
    </button>
  )
}
