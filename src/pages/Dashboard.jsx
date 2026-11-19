import { useEffect, useState } from 'react'
import { useEsteiras, useLeituras, useSensores } from '../hooks.js'
import { cadastrarEsteira } from '../services/api.js'
import { PecasPorHora, Proporcao } from '../components/Graficos.jsx'
import { ChartCard, HourlyStatistics, ProportionStatistics } from '../components/Estatisticas.jsx'
import { fmtData } from '../utils/estatisticas.js'

function tipoSensorLegivel(tipo) {
  const tipos = {
    FOTOELETRICO: 'Fotoelétrico', CAPACITIVO: 'Capacitivo', INDUTIVO: 'Indutivo',
    SENSOR_CONDUTIVO: 'Condutivo', SENSOR_CAPACITIVO: 'Capacitivo (legado)',
    SEM_SENSOR: 'Sem sensor', SENSOR_CAPACITIVO_CONDUTIVO: 'Capacitivo/condutivo (legado)',
  }
  return tipos[tipo] ?? tipo ?? 'Desconhecido'
}

export default function Dashboard() {
  const { esteiras, setEsteiras, erro: erroEsteiras, carregando: carregandoEsteiras } = useEsteiras()
  const [serial, setSerial] = useState('')
  const [novoSerial, setNovoSerial] = useState('')
  const [erroCadastro, setErroCadastro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const { sensores } = useSensores(serial)
  const { leituras, totalElements, erro, carregando } = useLeituras(serial, { pagina: 0, tamanho: 100 }, 10000)

  useEffect(() => {
    if (!serial && esteiras.length) setSerial(esteiras[0].numeroSerial)
  }, [esteiras, serial])

  async function criarEsteira(event) {
    event.preventDefault()
    setSalvando(true)
    setErroCadastro('')
    try {
      const esteira = await cadastrarEsteira(novoSerial)
      setEsteiras((atuais) => [...atuais, esteira].sort((a, b) => a.numeroSerial.localeCompare(b.numeroSerial)))
      setSerial(esteira.numeroSerial)
      setNovoSerial('')
    } catch (error) { setErroCadastro(error.message) }
    finally { setSalvando(false) }
  }

  const metalicas = leituras.filter((leitura) => leitura.tipoMaterial === 'METAL').length
  const plasticos = leituras.filter((leitura) => leitura.tipoMaterial === 'PLASTICO').length
  const semMaterial = leituras.filter((leitura) => leitura.tipoMaterial === 'SEM_MATERIAL').length
  const desconhecidos = leituras.filter((leitura) => leitura.tipoMaterial === 'DESCONHECIDO').length
  const ultima = leituras[0]

  return (
    <>
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
        <div>
          <h1 className="fs-2 mb-0">Monitoramento das esteiras</h1>
          <p className="text-secondary mb-0">Dados consultados no histórico paginado da API.</p>
        </div>
        {esteiras.length > 0 && <div className="flex-grow-1" style={{ maxWidth: 360 }}>
          <label htmlFor="esteira" className="form-label">Esteira</label>
          <select id="esteira" className="form-select" value={serial} onChange={(event) => setSerial(event.target.value)}>
            {esteiras.map((esteira) => <option key={esteira.id} value={esteira.numeroSerial}>{esteira.numeroSerial}</option>)}
          </select>
        </div>}
      </div>
      {(erroEsteiras || erro) && <div className="alert alert-warning">{erroEsteiras || erro}</div>}
      {!carregandoEsteiras && esteiras.length === 0 && <div className="card p-4 mb-3">
        <h2 className="fs-5">Cadastre a primeira esteira</h2>
        <p className="text-secondary">A API não oferece dados de demonstração. Informe o serial cadastrado no backend.</p>
        <form className="d-flex gap-2" onSubmit={criarEsteira}>
          <input className="form-control" aria-label="Número serial" value={novoSerial} onChange={(event) => setNovoSerial(event.target.value)} maxLength={100} required />
          <button className="btn btn-rm text-nowrap" disabled={salvando}>{salvando ? 'Salvando…' : 'Cadastrar esteira'}</button>
        </form>
        {erroCadastro && <div className="alert alert-danger mt-3 mb-0">{erroCadastro}</div>}
      </div>}
      {serial && <>
        <p className="text-secondary">{carregando ? 'Carregando leituras…' : `${totalElements} leitura(s) no histórico. Gráficos e contagens consideram a página atual (${leituras.length} itens, limite de 100).`}<br />Última leitura: {ultima ? fmtData(ultima.horario) : '--'}</p>
        <div className="row g-3 mb-3">
          <Kpi titulo="Total no histórico" valor={totalElements} detalhe="Todas as páginas da API" />
          <Kpi titulo="Metal" valor={metalicas} detalhe="Na página atual" />
          <Kpi titulo="Plástico" valor={plasticos} detalhe="Na página atual" />
          <Kpi titulo="Sem material / desconhecido" valor={`${semMaterial} / ${desconhecidos}`} detalhe="Na página atual" />
        </div>
        <div className="card p-3 mb-3">
          <h2 className="fs-5">Sensores cadastrados</h2>
          {sensores.length ? <div className="d-flex flex-wrap gap-2">{sensores.map((sensor) => <span className="badge text-bg-light border p-2" key={sensor.id}>Porta {sensor.porta}: {tipoSensorLegivel(sensor.tipoSensor)}{sensor.modelo ? ` · ${sensor.modelo}` : ''}</span>)}</div> : <p className="text-secondary mb-0">Nenhum sensor retornado para esta esteira.</p>}
        </div>
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <ChartCard title="Materiais na página atual" statistics={<ProportionStatistics metal={metalicas} other={plasticos + semMaterial + desconhecidos} />}>
              <Proporcao metalicas={metalicas} naoMetalicas={plasticos + semMaterial + desconhecidos} />
            </ChartCard>
          </div>
          <div className="col-12 col-lg-6">
            <ChartCard title="Leituras por hora" statistics={<HourlyStatistics readings={leituras} />}>
              <PecasPorHora leituras={leituras} />
            </ChartCard>
          </div>
        </div>
      </>}
    </>
  )
}

function Kpi({ titulo, valor, detalhe }) {
  return <div className="col-12 col-md-6 col-xl-3"><div className="card h-100 p-3"><div className="text-secondary small">{titulo}</div><div className="kpi-valor">{valor}</div><div className="text-secondary small">{detalhe}</div></div></div>
}
