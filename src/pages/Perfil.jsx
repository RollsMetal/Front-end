import { useState } from "react";
import { Link } from "react-router-dom";
import { pegarPerfil, salvarPerfil } from "../utils";
import Cabecalho from "../components/Cabecalho";

export default function Perfil() {
  const [perfil, setPerfil] = useState(pegarPerfil());
  const [senha, setSenha] = useState("");
  const [salvo, setSalvo] = useState(false);

  function alterar(campo, valor) {
    setPerfil({ ...perfil, [campo]: valor });
    setSalvo(false);
  }

  function salvar(e) {
    e.preventDefault();
    salvarPerfil(perfil); // a senha não é guardada aqui: ela deve ir para a API
    setSenha("");
    setSalvo(true);
  }

  return (
    <>
      <Cabecalho titulo="Meu perfil" subtitulo="Dados e acesso do usuário" />

      <div className="card mb-3">
        <div className="card-body d-flex align-items-center gap-3 flex-wrap">
          <span className="avatar grande">{(perfil.nome || "U").charAt(0).toUpperCase()}</span>
          <div>
            <div className="h5 mb-0">{perfil.nome || "Usuário sem nome"}</div>
            <div className="texto-fraco small">{perfil.acesso} · MetalTech</div>
          </div>
        </div>
      </div>

      <form className="card" onSubmit={salvar}>
        <div className="card-body row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label texto-fraco small" htmlFor="nome">Nome</label>
            <input id="nome" className="form-control" value={perfil.nome} onChange={(e) => alterar("nome", e.target.value)} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label texto-fraco small" htmlFor="email">E-mail</label>
            <input id="email" type="email" className="form-control" value={perfil.email} onChange={(e) => alterar("email", e.target.value)} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label texto-fraco small" htmlFor="acesso">Perfil de acesso</label>
            <select id="acesso" className="form-select" value={perfil.acesso} onChange={(e) => alterar("acesso", e.target.value)}>
              <option>Operador</option>
              <option>Analista</option>
              <option>Administrador</option>
            </select>
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label texto-fraco small" htmlFor="senha">Nova senha</label>
            <input id="senha" type="password" className="form-control" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <div className="col-12 d-flex align-items-center gap-3 flex-wrap">
            <button type="submit" className="btn btn-metal">Salvar perfil</button>
            <Link to="/" className="btn btn-outline-danger d-flex align-items-center" style={{ minHeight: 44 }}>Sair</Link>
            {salvo && <span className="text-success">Perfil salvo.</span>}
          </div>
        </div>
      </form>
    </>
  );
}
