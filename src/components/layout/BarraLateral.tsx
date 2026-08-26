import { useMemo, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useEstaciones } from '../../hooks/useEstaciones'
import { useOrdenEstacionesPnl } from '../../hooks/useOrdenEstacionesPnl'
import { normalizarNombre } from '../../utils/nombreEstacion'
import { obtenerConfigEstado } from '../../utils/fwi'
import { f1 } from '../../utils/formato'
import type { ResumenEstacion } from '../../types'

export const VISTAS = [
  { to: '/', etiqueta: 'Panel', fin: true },
  { to: '/comparar', etiqueta: 'Comparar', fin: false },
  { to: '/variables-meteorologicas', etiqueta: 'Ver variables meteorológicas actuales', fin: false },
]

function claseVista({ isActive }: { isActive: boolean }) {
  return `flex items-center text-left border-0 font-medium text-sm px-5 py-2.5 border-l-[3px] transition-colors ${
    isActive
      ? 'border-l-(--color-accent) text-(--color-accent-700)'
      : 'border-l-transparent text-(--color-text) hover:bg-(--color-neutral-100)'
  }`
}

function ContenidoBarra({ alNavegar }: { alNavegar?: () => void }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const { id: idActivo } = useParams<{ id: string }>()
  const { estaciones } = useEstaciones()
  const orden = useOrdenEstacionesPnl()
  const [filtro, setFiltro] = useState('')

  function cerrarSesion() {
    logout()
    navigate('/login')
  }

  function ir(id: string) {
    navigate(`/estacion/${id}`)
    alNavegar?.()
  }

  // Mismo orden que la tabla de Variables meteorológicas y Precipitaciones anuales.
  const ordenadas = useMemo((): ResumenEstacion[] => {
    if (orden.length === 0) return estaciones

    const porNombre = new Map(estaciones.map(e => [normalizarNombre(e.nombre), e]))
    const usadas = new Set<string>()

    const enOrden = orden
      .map(o => {
        const e = porNombre.get(o.normalizado)
        if (e) usadas.add(o.normalizado)
        return e
      })
      .filter((e): e is ResumenEstacion => e != null)

    const extras = estaciones.filter(e => !usadas.has(normalizarNombre(e.nombre)))

    return [...enOrden, ...extras]
  }, [estaciones, orden])

  const q = filtro.trim().toLowerCase()
  const lista = ordenadas
    .filter(e => !q || e.nombre.toLowerCase().includes(q) || e.id.toLowerCase().includes(q))

  return (
    <div className="flex flex-col h-full min-h-0">
      <nav className="flex flex-col py-2 border-b-2 border-(--color-divider)">
        {VISTAS.map(v => (
          <NavLink key={v.to} to={v.to} end={v.fin} className={claseVista} onClick={alNavegar}>
            {v.etiqueta}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 pt-4 pb-2 flex items-baseline justify-between">
        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--color-neutral-700)' }}>
          Estaciones
        </p>
        <span className="text-[11px] tabular-nums" style={{ color: 'var(--color-neutral-600)' }}>
          {estaciones.length}
        </span>
      </div>
      <div className="px-3 pb-3">
        <input
          className="input text-sm"
          type="search"
          placeholder="Buscar estación"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-4">
        {lista.map(e => {
          const config = obtenerConfigEstado(e.estado_fwi)
          const activa = e.id === idActivo
          return (
            <button
              key={e.id}
              onClick={() => ir(e.id)}
              className="w-full grid grid-cols-[4px_1fr_auto] items-center gap-2.5 text-left border-0 border-t border-(--color-neutral-200) py-2.5 pr-5 cursor-pointer"
              style={{ background: activa ? 'var(--color-accent-100)' : 'transparent' }}
            >
              <span className="h-6.5 w-1" style={{ background: config.tono }} />
              <span className="min-w-0">
                <span
                  className="block text-[13px] overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ fontWeight: activa ? 700 : 400 }}
                >
                  {e.nombre}
                </span>
                <span className="block text-[11px] tracking-wide" style={{ color: 'var(--color-neutral-600)' }}>
                  {config.etiqueta}
                </span>
              </span>
              <span className="font-heading font-extrabold text-[15px] tabular-nums">{f1(e.fwi)}</span>
            </button>
          )
        })}
      </div>

      <div className="border-t-2 border-(--color-divider) px-5 py-3 mb-[30px]">
        {usuario && (
          <p className="text-xs mb-1" style={{ color: 'var(--color-neutral-700)' }}>{usuario}</p>
        )}
        <button onClick={cerrarSesion} className="btn btn-ghost text-sm px-0">
          Cerrar sesión
        </button>
        <p className="text-[10px] tracking-wide mt-1" style={{ color: 'var(--color-neutral-600)' }}>
          Desarrollado por bRuno´s | Versión 1.0 (Beta) - Proyecto Modelo
        </p>
      </div>
    </div>
  )
}

export function BarraLateral() {
  return (
    <aside className="hidden lg:flex lg:flex-col border-r-2 border-(--color-divider) sticky top-24 h-[calc(100vh-96px)] w-66 shrink-0">
      <ContenidoBarra />
    </aside>
  )
}
