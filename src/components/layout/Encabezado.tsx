import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Encabezado() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const claseEnlace = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'font-semibold text-white'
      : 'text-emerald-100 hover:text-white transition-colors'

  function manejarCerrarSesion() {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-emerald-700 sticky top-0 z-10 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-10 py-[28px] sm:py-[33px] flex items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center gap-4 sm:gap-5 shrink-0">
          <img
            src={`${import.meta.env.BASE_URL}logo_pnl.png`}
            alt="Logo Parque Nacional Lanín"
            className="h-12 sm:h-14 w-auto object-contain shrink-0"
          />
          <div className="hidden md:block">
            <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wide leading-tight">
              Índice de Peligrosidad de Incendios
            </h1>
            <p className="text-sm sm:text-base text-emerald-100">
              Sistema de Información FWI · Parque Nacional Lanín
            </p>
          </div>
          <span className="text-2xl font-bold text-white md:hidden">SIFWI</span>
          <img
            src={`${import.meta.env.BASE_URL}logo_ice.png`}
            alt="Logo ICE"
            className="h-12 sm:h-14 w-auto object-contain shrink-0"
          />
        </NavLink>

        <nav className="flex items-center gap-5 text-base shrink-0">
          <NavLink to="/" end className={claseEnlace}>
            Inicio
          </NavLink>
          <NavLink to="/comparar" className={claseEnlace}>
            Comparar
          </NavLink>
          <span className="hidden sm:flex items-center gap-3 pl-3 border-l border-emerald-600">
            {usuario && <span className="text-sm text-emerald-100">{usuario}</span>}
            <button
              onClick={manejarCerrarSesion}
              className="text-emerald-100 hover:text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </span>
        </nav>
      </div>
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500" />
    </header>
  )
}
