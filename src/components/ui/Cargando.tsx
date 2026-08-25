interface Props {
  mensaje?: string
}

export function Cargando({ mensaje = 'Cargando...' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div
        className="w-8 h-8 border-4 rounded-full animate-spin"
        style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
      />
      <p className="text-sm" style={{ color: 'var(--color-neutral-700)' }}>{mensaje}</p>
    </div>
  )
}
