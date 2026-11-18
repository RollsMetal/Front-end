import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { encerrarSessao, possuiSessaoConfirmada } from '../services/session.js'

export default function Layout() {
  const navigate = useNavigate()

  if (!possuiSessaoConfirmada()) return <Navigate to="/login" replace />

  function sair() {
    encerrarSessao()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <nav className="navbar navbar-expand-md navbar-rm px-3">
        <span className="navbar-brand text-white fw-bold">
          RollsMetal <span style={{ color: '#fdba74', fontWeight: 500 }}>Monitoramento</span>
        </span>
        <div className="ms-auto d-flex gap-2 flex-wrap">
          <NavLink to="/" className="nav-link px-3">Dashboard</NavLink>
          <NavLink to="/historico" className="nav-link px-3">Histórico</NavLink>
          <NavLink to="/ra" className="nav-link px-3">Realidade Aumentada</NavLink>
          <button type="button" className="btn btn-outline-light btn-sm px-3" onClick={sair}>Sair</button>
        </div>
      </nav>
      <main className="container py-4">
        <Outlet />
      </main>
    </>
  )
}
