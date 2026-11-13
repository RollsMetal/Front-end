import { NavLink } from "react-router-dom";
import { pegarPerfil } from "../utils";

const links = [
  { texto: "Dashboard", caminho: "/" },
  { texto: "Sensores", caminho: "/sensores" },
  { texto: "Histórico", caminho: "/historico" },
  { texto: "Análises", caminho: "/analises" },
  { texto: "Alertas", caminho: "/alertas" },
  { texto: "Realidade Aumentada", caminho: "/realidade-aumentada" },
  { texto: "Configurações", caminho: "/configuracoes" },
];

export default function Sidebar() {
  const perfil = pegarPerfil();
  const inicial = (perfil.nome || "U").charAt(0).toUpperCase();

  return (
    <nav className="sidebar">
      <div className="logo">
        <span>Metal</span>Tech
      </div>
      {links.map((l) => (
        <NavLink key={l.caminho} to={l.caminho} end className="link-menu">
          {l.texto}
        </NavLink>
      ))}
      <NavLink to="/perfil" className="link-menu perfil">
        <span className="avatar">{inicial}</span>
        Meu perfil
      </NavLink>
    </nav>
  );
}
