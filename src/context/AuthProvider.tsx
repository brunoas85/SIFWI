import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { iniciarSesion, registrarManejador401 } from '../api/fwi'
import { CLAVE_TOKEN } from '../utils/sesion'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    setToken(localStorage.getItem(CLAVE_TOKEN))
    setCargando(false)
  }, [])

  useEffect(() => {
    registrarManejador401(() => {
      setToken(null)
      setUsuario(null)
    })
  }, [])

  async function login(usuarioIngresado: string, contrasena: string) {
    const respuesta = await iniciarSesion(usuarioIngresado, contrasena)
    localStorage.setItem(CLAVE_TOKEN, respuesta.token)
    setToken(respuesta.token)
    setUsuario(respuesta.usuario)
  }

  function logout() {
    localStorage.removeItem(CLAVE_TOKEN)
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ token, usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
