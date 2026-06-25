import { useEffect, type ReactNode } from 'react'

interface Props {
  titulo: string
  onClose: () => void
  children: ReactNode
}

export function ModalAmpliado({ titulo, onClose, children }: Props) {
  useEffect(() => {
    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', alPresionarTecla)
    return () => window.removeEventListener('keydown', alPresionarTecla)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">{titulo}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
