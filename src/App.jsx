import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import CadastroUsuario from './pages/CadastroUsuario.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Historico from './pages/Historico.jsx'
import RealidadeAumentada from './pages/RealidadeAumentada.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CadastroUsuario />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/ra" element={<RealidadeAumentada />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
