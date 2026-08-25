import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { RutaProtegida } from './components/auth/RutaProtegida'
import { LayoutPrincipal } from './components/layout/LayoutPrincipal'
import { Login } from './pages/Login'
import { Inicio } from './pages/Inicio'
import { DetalleEstacion } from './pages/DetalleEstacion'
import { Comparar } from './pages/Comparar'
import { VistaMeteorologica } from './pages/VistaMeteorologica'

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
              <Route path="comparar" element={<Comparar />} />
              <Route path="variables-meteorologicas" element={<VistaMeteorologica />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
