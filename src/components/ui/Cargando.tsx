interface Props {
  mensaje?: string
}

export function Cargando({ mensaje = 'Cargando...' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">{mensaje}</p>
    </div>
  )
}
