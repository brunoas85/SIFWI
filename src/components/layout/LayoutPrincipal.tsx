import { Outlet } from 'react-router-dom'
import { BarraLateral } from './BarraLateral'

export function LayoutPrincipal() {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[264px_1fr]" style={{ background: 'var(--color-bg)' }}>
      <BarraLateral />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
