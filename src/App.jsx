import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Historico from './pages/Historico.jsx'
import RealidadeAumentada from './pages/RealidadeAumentada.jsx'

function Protegida({ children }) {
  return sessionStorage.getItem('token') ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protegida><Layout /></Protegida>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/ra" element={<RealidadeAumentada />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
