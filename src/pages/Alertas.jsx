import { useState } from "react";
import { useLeituras } from "../useLeituras";
import { estatisticas, pegarConfig, statusSensores, formatarHora } from "../utils";
import Cabecalho from "../components/Cabecalho";

export default function Alertas() {
  const { leituras, offline } = useLeituras();
  const [reconhecidos, setReconhecidos] = useState([]);
  const config = pegarConfig();

  const alertas = [];
  const ultima = leituras[leituras.length - 1];
  const stats = estatisticas(leituras.map((l) => l.nivel));

  if (ultima && ultima.nivel > config.limite) {
    alertas.push({
      id: "nivel",
      gravidade: "Crítico",
      cor: "danger",
      texto: `Reservatório em ${Math.round(ultima.nivel)}%, acima do limite de ${config.limite}%`,
      quando: formatarHora(ultima.horario),
    });
  }
  if (stats && stats.outliers.length > 0) {
    alertas.push({
      id: "outlier",
      gravidade: "Atenção",
      cor: "warning",
      texto: `${stats.outliers.length} leitura(s) de nível fora do padrão estatístico`,
      quando: "Análise atual",
    });
  }
  statusSensores(leituras)
    .filter((s) => leituras.length > 0 && !s.online)
    .forEach((s) => {
      alertas.push({
        id: `sensor-${s.nome}`,
        gravidade: "Atenção",
        cor: "warning",
        texto: `Sensor ${s.nome.toLowerCase()} sem leitura há mais de 1 minuto`,
        quando: s.ultima > 0 ? formatarHora(s.ultima) : "Sem leituras",
      });
    });

  return (
    <>
      <Cabecalho titulo="Alertas" subtitulo="Ocorrências e anomalias detectadas" offline={offline} />

      <div className="d-flex flex-column gap-3">
        {alertas.length === 0 && (
          <div className="card">
            <div className="card-body texto-fraco">Nenhum alerta no momento.</div>
          </div>
        )}
        {alertas.map((a) => {
          const visto = reconhecidos.includes(a.id);
          return (
            <div className="card" key={a.id} style={{ opacity: visto ? 0.6 : 1 }}>
              <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <span className={`badge rounded-pill text-bg-${a.cor}`}>{a.gravidade}</span>
                  <div>
                    <div>{a.texto}</div>
                    <div className="texto-fraco small">{a.quando}</div>
                  </div>
                </div>
                <button
                  className="btn btn-metal"
                  disabled={visto}
                  onClick={() => setReconhecidos([...reconhecidos, a.id])}
                >
                  {visto ? "Reconhecido" : "Reconhecer"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
