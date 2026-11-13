import { useLeituras } from "../useLeituras";
import { pegarConfig, statusSensores, formatarHora } from "../utils";
import Cabecalho from "../components/Cabecalho";

function CartaoSensor({ titulo, descricao, valor, unidade, classe, status, detalhe }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center gap-2">
          <strong>{titulo}</strong>
          <span className={`badge ${status.online ? "text-bg-success" : "text-bg-danger"}`}>
            ● {status.online ? "Online" : "Offline"}
          </span>
        </div>
        <div className="texto-fraco small mt-1">{descricao}</div>
        <div className={`numero-grande mt-3 ${classe}`}>{valor}</div>
        <div className="texto-fraco small">{unidade}</div>
        <div className="texto-fraco small mt-3">
          {detalhe} {status.ultima > 0 && `· última leitura às ${formatarHora(status.ultima)}`}
        </div>
      </div>
    </div>
  );
}

export default function Sensores() {
  const { leituras, offline } = useLeituras();
  const config = pegarConfig();
  const [indutivo, capacitivo, iolink] = statusSensores(leituras);
  const ultima = leituras[leituras.length - 1];

  return (
    <>
      <Cabecalho titulo="Sensores" subtitulo="Indutivo, capacitivo e IO-Link da esteira" offline={offline} />

      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6 col-xl-4">
          <CartaoSensor
            titulo="Sensor indutivo"
            descricao="Detecta peças metálicas"
            valor={leituras.filter((l) => l.tipo === "METALICA").length}
            unidade="peças metálicas"
            classe="cor-metal"
            status={indutivo}
            detalhe="Saída digital"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <CartaoSensor
            titulo="Sensor capacitivo"
            descricao="Detecta peças não metálicas"
            valor={leituras.filter((l) => l.tipo === "NAO_METALICA").length}
            unidade="peças não metálicas"
            classe="cor-nao"
            status={capacitivo}
            detalhe="Saída digital"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <CartaoSensor
            titulo="Sensor IO-Link"
            descricao="Distância e nível do reservatório"
            valor={ultima ? `${Math.round(ultima.nivel)}%` : "0%"}
            unidade={`distância: ${ultima ? ultima.distanciaMm : 0} mm`}
            status={iolink}
            detalhe={`Mestre IO-Link ${config.mestre || "(não configurado)"}, porta ${config.porta}`}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="h6 mb-3">Fluxo dos dados</h2>
          <div className="d-flex align-items-center flex-wrap gap-2">
            {["Sensores", "CLP / mestre IO-Link", "API REST (Spring Boot)", "Dashboard e app de RA"].map((etapa, i) => (
              <span key={etapa} className="d-flex align-items-center gap-2">
                {i > 0 && <span className="texto-fraco">→</span>}
                <span className="badge text-bg-dark p-2 fw-normal">{etapa}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
