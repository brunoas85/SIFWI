import { useMemo } from 'react'

interface Particula {
  id: number
  izquierda: number
  tamaño: number
  duracion: number
  retraso: number
  deriva: number
  color: string
}

// Paleta tenue acorde a las cards: verde, ámbar, naranja.
const COLORES = ['#6ee7b7', '#fcd34d', '#fdba74', '#a7f3d0']

function generarParticulas(cantidad: number): Particula[] {
  return Array.from({ length: cantidad }, (_, i) => {
    const duracion = 14 + Math.random() * 14
    return {
      id: i,
      izquierda: Math.random() * 100,
      tamaño: 4 + Math.random() * 6,
      duracion,
      // Retraso negativo: ya hay partículas a mitad de recorrido desde el primer render.
      retraso: -Math.random() * duracion,
      deriva: (Math.random() - 0.5) * 100,
      color: COLORES[Math.floor(Math.random() * COLORES.length)],
    }
  })
}

export function ParticulasSuaves() {
  const particulas = useMemo(() => generarParticulas(40), [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {particulas.map(p => (
        <span
          key={p.id}
          className="particula-suave"
          style={{
            left: `${p.izquierda}%`,
            width: p.tamaño,
            height: p.tamaño * 1.6,
            background: p.color,
            color: p.color,
            animationDuration: `${p.duracion}s`,
            animationDelay: `${p.retraso}s`,
            ['--deriva' as string]: `${p.deriva}px`,
          }}
        />
      ))}
    </div>
  )
}
