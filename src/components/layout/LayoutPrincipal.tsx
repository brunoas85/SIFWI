import { Outlet } from 'react-router-dom'
import { BarraLateral } from './BarraLateral'
import { MenuMovil } from './MenuMovil'

export function LayoutPrincipal() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <header
        className="sticky top-0 z-40 flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-8"
        style={{ background: 'var(--color-accent)' }}
      >
        <MenuMovil />
        <img
          src={`${import.meta.env.BASE_URL}logo_pnl.png`}
          alt="Parque Nacional Lanín"
          className="h-[72px] w-[72px] object-contain shrink-0"
        />
        <img
          src={`${import.meta.env.BASE_URL}logo_ice2.png`}
          alt="ICE"
          className="h-[72px] w-[72px] object-contain shrink-0"
        />
        <p className="font-heading font-extrabold text-base sm:text-lg lg:text-xl leading-[1.1] tracking-[-0.01em] text-white">
          Gestor de Información Meteorológica del Parque Nacional Lanín <span className="whitespace-nowrap">(GIM)</span>
        </p>
      </header>

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[264px_1fr]">
        <BarraLateral />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
