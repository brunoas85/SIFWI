import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { VISTAS } from './BarraLateral'

function claseVista({ isActive }: { isActive: boolean }) {
  return `btn btn-secondary w-full justify-start text-sm ${isActive ? 'text-(--color-accent-700)' : ''}`
}

export function MenuMovil() {
  const [abierto, setAbierto] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  function cerrar() {
    setAbierto(false)
  }

  function cerrarSesion() {
    logout()
    navigate('/login')
    cerrar()
  }

  return (
    <div className="lg:hidden relative">
      <button
        onClick={() => setAbierto(a => !a)}
        className="btn btn-icon"
        aria-label="Abrir menú"
        style={{ color: '#fff' }}
      >
        ☰
      </button>

      {abierto && (
        <>
          <div className="fixed inset-0 z-40" onClick={cerrar} />
          <div
            className="absolute left-0 top-full mt-2 w-64 max-w-[80vw] p-2 rounded-lg border-2 z-50 flex flex-col gap-1"
            style={{ background: 'var(--color-bg)', borderColor: 'var(--color-divider)' }}
          >
            {VISTAS.map(v => (
              <NavLink key={v.to} to={v.to} end={v.fin} className={claseVista} onClick={cerrar}>
                {v.etiqueta}
              </NavLink>
            ))}
            <div className="h-px my-1" style={{ background: 'var(--color-divider)' }} />
            <button onClick={cerrarSesion} className="btn btn-ghost w-full justify-start text-sm">
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  )
}
