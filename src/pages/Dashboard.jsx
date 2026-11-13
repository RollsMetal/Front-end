import { Link } from "react-router-dom";
import { useLeituras } from "../useLeituras";
import { pegarConfig, statusSensores } from "../utils";
import Cabecalho from "../components/Cabecalho";
import Kpi from "../components/Kpi";
import BarraNivel from "../components/BarraNivel";

export default function Dashboard() {
  const { leituras, offline } = useLeituras();
  const config = pegarConfig();

  const metalicas = leituras.filter((l) => l.tipo === "METALICA").length;
  const naoMetalicas = leituras.filter((l) => l.tipo === "NAO_METALICA").length;
  const total = metalicas + naoMetalicas;
  const ultima = leituras[leituras.length - 1];
  const nivel = ultima ? Math.round(ultima.nivel) : 0;
  const acima = nivel > config.limite;
  const percMetal = total > 0 ? Math.round((metalicas / total) * 100) : 0;

  // Divide as leituras em 6 grupos para o gráfico
  const tamanho = Math.max(1, Math.ceil(leituras.length / 6));
  const grupos = [];
  for (let i = 0; i < leituras.length; i += tamanho) {
    const parte = leituras.slice(i, i + tamanho);
    grupos.push({
      metal: parte.filter((l) => l.tipo === "METALICA").length,
      nao: parte.filter((l) => l.tipo === "NAO_METALICA").length,
    });
  }
  const maior = Math.max(1, ...grupos.map((g) => Math.max(g.metal, g.nao)));

  return (
    <>
      <Cabecalho titulo={config.esteira} subtitulo="Atualiza a cada 3 segundos" offline={offline} />

      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <span className="texto-fraco small">Sensores:</span>
        {statusSensores(leituras).map((s) => (
          <Link key={s.nome} to="/sensores" className="badge rounded-pill text-bg-dark text-decoration-none p-2">
            <span style={{ color: s.online ? "#7ee2a8" : "var(--mt-alerta)" }}>●</span> {s.nome}
          </Link>
        ))}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-xl-3">
          <Kpi rotulo="Metálicas · sensor indutivo" valor={metalicas} classe="cor-metal" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <Kpi rotulo="Não metálicas · sensor capacitivo" valor={naoMetalicas} classe="cor-nao" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <Kpi rotulo="Total na esteira" valor={total} />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <Kpi rotulo="Reservatório · sensor IO-Link" valor={`${nivel}%`} alerta={acima} />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h6 mb-3">Contagem por período</h2>
              <div className="grafico">
                {grupos.map((g, i) => (
                  <div className="coluna" key={i}>
                    <div style={{ height: `${(g.metal / maior) * 100}%`, background: "var(--mt-metal)" }}></div>
                    <div style={{ height: `${(g.nao / maior) * 100}%`, background: "var(--mt-nao)" }}></div>
                  </div>
                ))}
              </div>
              <div className="texto-fraco small mt-2">Azul: metálicas · Laranja: não metálicas</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h6 mb-3">Reservatório de saída</h2>
              <BarraNivel nivel={nivel} limite={config.limite} />
              <h2 className="h6 mt-4 mb-3">Proporção</h2>
              <div className="progress" style={{ height: 16 }}>
                <div className="progress-bar" style={{ width: `${percMetal}%`, background: "var(--mt-metal)" }}></div>
                <div className="progress-bar" style={{ width: `${total > 0 ? 100 - percMetal : 0}%`, background: "var(--mt-nao)" }}></div>
              </div>
              <div className="texto-fraco small mt-2">
                {percMetal}% metálicas · {total > 0 ? 100 - percMetal : 0}% não metálicas
              </div>
            </div>
          </div>
        </div>
      </div>

      {acima && (
        <div className="card">
          <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <div className="fw-medium">⚠ Alerta: reservatório acima do limite</div>
              <div className="texto-fraco small">
                Nível em {nivel}%, limite configurado em {config.limite}%.
              </div>
            </div>
            <Link to="/alertas" className="btn btn-metal d-flex align-items-center">
              Ver detalhes
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
