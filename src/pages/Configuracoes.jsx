import { useState } from "react";
import { pegarConfig, salvarConfig } from "../utils";
import Cabecalho from "../components/Cabecalho";

export default function Configuracoes() {
  const [config, setConfig] = useState(pegarConfig());
  const [salvo, setSalvo] = useState(false);

  function alterar(campo, valor) {
    setConfig({ ...config, [campo]: valor });
    setSalvo(false);
  }

  function salvar(e) {
    e.preventDefault();
    salvarConfig({ ...config, limite: Number(config.limite), porta: Number(config.porta) });
    setSalvo(true);
  }

  return (
    <>
      <Cabecalho titulo="Configurações" subtitulo="Parâmetros da esteira e dos sensores" />

      <form className="card" onSubmit={salvar}>
        <div className="card-body row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label texto-fraco small" htmlFor="esteira">Nome da esteira</label>
            <input id="esteira" className="form-control" value={config.esteira} onChange={(e) => alterar("esteira", e.target.value)} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label texto-fraco small" htmlFor="limite">Limite de alerta do reservatório (%)</label>
            <input id="limite" type="number" min="1" max="100" className="form-control" value={config.limite} onChange={(e) => alterar("limite", e.target.value)} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label texto-fraco small" htmlFor="mestre">Endereço do mestre IO-Link</label>
            <input id="mestre" className="form-control" placeholder="Ex.: 192.168.0.10" value={config.mestre} onChange={(e) => alterar("mestre", e.target.value)} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label texto-fraco small" htmlFor="porta">Porta do sensor IO-Link</label>
            <input id="porta" type="number" min="1" className="form-control" value={config.porta} onChange={(e) => alterar("porta", e.target.value)} />
          </div>
          <div className="col-12 d-flex align-items-center gap-3 flex-wrap">
            <button type="submit" className="btn btn-metal">Salvar configurações</button>
            {salvo && <span className="text-success">Configurações salvas.</span>}
          </div>
        </div>
      </form>
    </>
  );
}
