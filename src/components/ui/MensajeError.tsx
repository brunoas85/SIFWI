interface Props {
  mensaje: string
  onReintentar?: () => void
}

export function MensajeError({ mensaje, onReintentar }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-red-600 font-medium">{mensaje}</p>
      {onReintentar && (
        <button
          onClick={onReintentar}
          className="text-sm text-blue-600 hover:underline"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
