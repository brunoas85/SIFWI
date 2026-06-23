import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { RutaProtegida } from './components/auth/RutaProtegida'
import { LayoutPrincipal } from './components/layout/LayoutPrincipal'
import { Login } from './pages/Login'
import { Inicio } from './pages/Inicio'
import { DetalleEstacion } from './pages/DetalleEstacion'
import { IndicesFwiEstacion } from './pages/IndicesFwiEstacion'
import { Comparar } from './pages/Comparar'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RutaProtegida />}>
            <Route path="/" element={<LayoutPrincipal />}>
              <Route index element={<Inicio />} />
              <Route path="estacion/:id" element={<DetalleEstacion />} />
              <Route path="estacion/:id/indices" element={<IndicesFwiEstacion />} />
              <Route path="comparar" element={<Comparar />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
