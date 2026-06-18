import { Outlet } from 'react-router-dom'
import { Encabezado } from './Encabezado'
import { ParticulasSuaves } from '../ui/ParticulasSuaves'

export function LayoutPrincipal() {
  return (
    <div className="min-h-screen fondo-dinamico flex flex-col relative">
      <ParticulasSuaves />
      <div className="relative z-10 flex flex-col flex-1">
        <Encabezado />
        <main className="flex-1 p-4 sm:p-6 lg:px-10 max-w-[1920px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
