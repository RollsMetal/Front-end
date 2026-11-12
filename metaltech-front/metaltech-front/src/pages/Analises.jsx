import { useLeituras } from "../useLeituras";
import { estatisticas, formatarNumero, ESTATISTICAS_ZERADAS } from "../utils";
import Cabecalho from "../components/Cabecalho";

export default function Analises() {
  const { leituras, offline } = useLeituras();
  const stats = estatisticas(leituras.map((l) => l.nivel)) || ESTATISTICAS_ZERADAS;

  // Histograma do nível: faixas de 10 em 10
  const faixas = [];
  for (let ini = 0; ini < 100; ini += 10) {
    faixas.push({
      ini,
      qtd: leituras.filter((l) => l.nivel >= ini && l.nivel < ini + 10).length,
    });
  }
  const maior = Math.max(1, ...faixas.map((f) => f.qtd));

  const cartoes = [
    ["Média", stats.media],
    ["Mediana", stats.mediana],
    ["Moda", stats.moda],
    ["Desvio padrão", stats.desvio],
    ["Q1", stats.q1],
    ["Q3", stats.q3],
  ];

  const inicioFio = Math.max(stats.min, stats.limiteInferior);
  const fimFio = Math.min(stats.max, stats.limiteSuperior);

  return (
    <>
      <Cabecalho titulo="Análises" subtitulo="Estatística descritiva do nível do reservatório" offline={offline} />

      <div className="row g-3 mb-3">
        {cartoes.map(([nome, valor]) => (
          <div className="col-6 col-md-4 col-xl-2" key={nome}>
            <div className="card h-100">
              <div className="card-body">
                <div className="texto-fraco small">{nome}</div>
                <div className="h3 mb-0 mt-1">{formatarNumero(valor)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h6 mb-3">Histograma do nível do reservatório</h2>
              <div className="grafico">
                {faixas.map((f) => (
                  <div key={f.ini} className="coluna">
                    <div style={{ height: `${(f.qtd / maior) * 100}%`, background: "var(--mt-metal)" }}></div>
                  </div>
                ))}
              </div>
              <div className="d-flex gap-2 mt-1">
                {faixas.map((f) => (
                  <div key={f.ini} className="rotulo-grafico">{f.ini}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h6 mb-3">Boxplot do nível</h2>
              <div className="boxplot">
                <div className="linha" style={{ left: `${inicioFio}%`, width: `${fimFio - inicioFio}%` }}></div>
                <div className="caixa" style={{ left: `${stats.q1}%`, width: `${stats.q3 - stats.q1}%` }}></div>
                <div className="mediana" style={{ left: `${stats.mediana}%` }}></div>
                {stats.outliers.map((o, i) => (
                  <div key={i} className="outlier" style={{ left: `${o}%` }}></div>
                ))}
              </div>
              <div className="texto-fraco small mt-3">Escala de 0 a 100%. Pontos vermelhos são outliers.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="fw-medium">Critério de alerta</div>
          <div className="texto-fraco small mt-1">
            Alertar quando o nível passar de Q3 + 1,5 × (Q3 − Q1) = {formatarNumero(stats.limiteSuperior)}%.
            Outliers encontrados: {stats.outliers.length}.
          </div>
        </div>
      </div>
    </>
  );
}
