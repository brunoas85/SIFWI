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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" style={{ background: 'var(--color-bg)' }}>
      <div
        className="relative overflow-hidden hidden lg:flex flex-col justify-between p-12"
        style={{ background: 'var(--color-accent)' }}
      >
        <div
          className="absolute -inset-[10%] opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 2px,transparent 2px),linear-gradient(90deg,#fff 2px,transparent 2px)',
            backgroundSize: '72px 72px',
          }}
        />
        <p className="relative m-0 font-heading font-extrabold text-[15px] tracking-[0.18em] uppercase text-white">
          GIM
        </p>
        <h1 className="relative m-0 font-heading font-extrabold text-white leading-[1.02] tracking-[-0.02em] text-4xl xl:text-5xl text-balance">
          Gestor de Información Meteorológica del Parque Nacional Lanín (GIM)
        </h1>
        <p className="relative m-0 text-[15px] leading-relaxed text-white max-w-[34ch]">
          Análisis de Peligrosidad de Incendios Forestales (FWI)
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[360px]">
          <div className="flex gap-6 mb-10">
            <img src={`${import.meta.env.BASE_URL}logo_pnl.png`} alt="Parque Nacional Lanín" className="h-26 w-auto object-contain" />
            <img src={`${import.meta.env.BASE_URL}logo_ice.png`} alt="ICE" className="h-26 w-auto object-contain" />
          </div>
          <h2 className="font-heading font-extrabold text-[28px] tracking-[-0.02em] mb-1">Ingresar</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--color-neutral-700)' }}>
            Acceso para personal del parque.
          </p>

          <form onSubmit={manejarEnvio} className="flex flex-col gap-5">
            <div className="field">
              <label htmlFor="u">Usuario</label>
              <input
                id="u"
                type="text"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                autoFocus
                required
                className="input"
              />
            </div>
            <div className="field">
              <label htmlFor="p">Contraseña</label>
              <input
                id="p"
                type="password"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                required
                className="input"
              />
            </div>

            {error && <p className="text-sm" style={{ color: 'var(--color-accent-700)' }}>{error}</p>}

            <button type="submit" disabled={cargando} className="btn btn-primary btn-block mt-1">
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
