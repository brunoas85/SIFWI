import { Outlet } from 'react-router-dom'
import { Encabezado } from './Encabezado'

export function LayoutPrincipal() {
  return (
    <div className="min-h-screen fondo-dinamico flex flex-col">
      <Encabezado />
      <main className="flex-1 p-4 sm:p-6 lg:px-10 max-w-[1920px] mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
