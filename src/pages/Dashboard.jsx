import { useLeituras } from '../hooks.js'
import { LinhaNivel, Proporcao } from '../components/Graficos.jsx'
import { fmt, fmtData, limiteAlerta } from '../utils/estatisticas.js'

function Kpi({ titulo, valor, detalhe }) {
  return (
    <div className="col-12 col-md-6 col-xl-3">
      <div className="card h-100 p-3">
        <div className="text-secondary small">{titulo}</div>
        <div className="kpi-valor">{valor}</div>
        <div className="text-secondary small">{detalhe}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { leituras, erro } = useLeituras(5000)
  const met = leituras.filter((l) => l.metalica).length
  const nao = leituras.length - met
  const niveis = leituras.map((l) => l.nivel).filter((n) => !Number.isNaN(n))
  const atual = leituras.length ? leituras[0].nivel : null
  const limite = limiteAlerta(niveis)
  const alerta = limite !== null && atual !== null && atual > limite
  const serie = [...niveis].reverse()

  return (
    <>
      <div className="mb-3">
        <h1 className="fs-2 mb-0">Esteira de triagem</h1>
        <p className="text-secondary mb-0">
          Última atualização: {leituras.length ? fmtData(leituras[0].horario) : '--'}
        </p>
      </div>
      {erro && <div className="alert alert-warning">{erro}</div>}
      <div className="row g-3 mb-3">
        <Kpi titulo="Peças metálicas" valor={leituras.length ? met : '--'} detalhe="Sensor indutivo" />
        <Kpi titulo="Peças não metálicas" valor={leituras.length ? nao : '--'} detalhe="Sensor capacitivo" />
        <Kpi titulo="Total de peças" valor={leituras.length ? leituras.length : '--'} detalhe="Contagem da esteira" />
        <Kpi titulo="Nível do reservatório" valor={`${fmt(atual)}%`} detalhe="Leitura mais recente" />
      </div>
      {alerta && <div className="alert alert-danger">Alerta: nível do reservatório acima do limite ({fmt(limite)}%).</div>}
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card p-3 h-100"><h2 className="fs-5">Evolução do nível</h2><LinhaNivel valores={serie} /></div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card p-3 h-100"><h2 className="fs-5">Metálicas x não metálicas</h2><Proporcao metalicas={met} naoMetalicas={nao} /></div>
        </div>
      </div>
    </>
  )
}
