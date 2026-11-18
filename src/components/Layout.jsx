import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <>
      <nav className="navbar navbar-expand-md navbar-rm px-3">
        <span className="navbar-brand text-white fw-bold">
          RollsMetal <span style={{ color: '#fdba74', fontWeight: 500 }}>Monitoramento</span>
        </span>
        <div className="ms-auto d-flex gap-2 flex-wrap">
          <NavLink to="/dashboard" className="nav-link px-3">Dashboard</NavLink>
          <NavLink to="/historico" className="nav-link px-3">Histórico</NavLink>
          <NavLink to="/ra" className="nav-link px-3">Realidade Aumentada</NavLink>
        </div>
      </nav>
      <main className="container py-4">
        <Outlet />
      </main>
    </>
  )
}
