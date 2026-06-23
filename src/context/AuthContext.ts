import { createContext } from 'react'

export interface AuthContextValor {
  token: string | null
  usuario: string | null
  cargando: boolean
  login: (usuario: string, contrasena: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValor | null>(null)
