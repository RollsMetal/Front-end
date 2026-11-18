import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import CadastroUsuario from './pages/CadastroUsuario.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Historico from './pages/Historico.jsx'
import Login from './pages/Login.jsx'
import RealidadeAumentada from './pages/RealidadeAumentada.jsx'
import { possuiSessaoConfirmada } from './services/session.js'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={possuiSessaoConfirmada() ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/cadastro" element={<CadastroUsuario />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="historico" element={<Historico />} />
        <Route path="ra" element={<RealidadeAumentada />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
