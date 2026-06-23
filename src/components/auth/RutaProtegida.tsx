import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Cargando } from '../ui/Cargando'

export function RutaProtegida() {
  const { token, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) return <Cargando mensaje="Verificando sesión..." />
  if (!token) return <Navigate to="/login" replace state={{ from: ubicacion }} />

  return <Outlet />
}
