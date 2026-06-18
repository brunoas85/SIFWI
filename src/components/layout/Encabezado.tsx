import { NavLink } from 'react-router-dom'

export function Encabezado() {
  const claseEnlace = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'font-semibold text-emerald-700'
      : 'text-gray-600 hover:text-emerald-600 transition-colors'

  return (
    <header className="bg-white sticky top-0 z-10 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-emerald-700">SIFWI</span>
          </NavLink>
          <span className="text-xs text-gray-400 hidden sm:inline">
            Sistema de Información FWI · Parque Nacional Lanín
          </span>
        </div>
        <nav className="flex gap-5 text-sm">
          <NavLink to="/" end className={claseEnlace}>
            Inicio
          </NavLink>
          <NavLink to="/comparar" className={claseEnlace}>
            Comparar
          </NavLink>
        </nav>
      </div>
      <div className="h-1 bg-gradient-to-r from-emerald-600 via-amber-500 to-red-600" />
    </header>
  )
}
