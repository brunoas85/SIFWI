interface Props {
  mensaje: string
  onReintentar?: () => void
}

export function MensajeError({ mensaje, onReintentar }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="font-medium" style={{ color: 'var(--color-accent-700)' }}>{mensaje}</p>
      {onReintentar && (
        <button onClick={onReintentar} className="btn btn-ghost text-sm">
          Reintentar
        </button>
      )}
    </div>
  )
}
