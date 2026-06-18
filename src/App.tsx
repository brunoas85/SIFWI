import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LayoutPrincipal } from './components/layout/LayoutPrincipal'
import { Inicio } from './pages/Inicio'
import { DetalleEstacion } from './pages/DetalleEstacion'
import { Comparar } from './pages/Comparar'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutPrincipal />}>
          <Route index element={<Inicio />} />
          <Route path="estacion/:id" element={<DetalleEstacion />} />
          <Route path="comparar" element={<Comparar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
