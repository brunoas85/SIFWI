import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const ubicacion = useLocation()

  async function manejarEnvio(e: FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    try {
      await login(usuario, contrasena)
      const destino = (ubicacion.state as { from?: Location })?.from?.pathname ?? '/'
      navigate(destino, { replace: true })
    } catch {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500" />
        <div className="px-8 py-10">
          <div className="flex justify-center gap-6 mb-6">
            <img src="/logo_pnl.png" alt="Logo Parque Nacional Lanín" className="h-12 w-auto object-contain" />
            <img src="/logo_ice.png" alt="Logo ICE" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 text-center uppercase tracking-wide mb-1">
            SIFWI
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Ingresá tus credenciales para continuar
          </p>

          <form onSubmit={manejarEnvio} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Usuario</label>
              <input
                type="text"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                autoFocus
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Contraseña</label>
              <input
                type="password"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
