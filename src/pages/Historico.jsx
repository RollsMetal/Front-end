import { useEffect, useState } from 'react'
import { useEsteiras, useLeituras, useSensores } from '../hooks.js'
import { fmtData } from '../utils/estatisticas.js'
import { HourlyChart, ProportionChart } from '../components/Estatisticas.jsx'

function paraIsoComOffset(valorLocal) {
  if (!valorLocal) return ''
  const data = new Date(valorLocal)
  return Number.isNaN(data.getTime()) ? '' : data.toISOString()
}

function exportarCsv(lista) {
  const linhas = lista.map((leitura) => [
    fmtData(leitura.horario), leitura.id ?? '', leitura.sensorId ?? '', leitura.porta ?? '',
    leitura.tipoMaterial, leitura.modelo ?? '', leitura.tipoSensor ?? '', leitura.hexadecimal,
  ].join(';'))
  const csv = '\uFEFF' + ['Data;Leitura;Sensor;Porta;Material;Modelo;Tipo de sensor;Hexadecimal', ...linhas].join('\n')
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  link.download = 'leituras-rollsmetal.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

export default function Historico() {
  const { esteiras, carregando: carregandoEsteiras, erro: erroEsteiras } = useEsteiras()
  const [serial, setSerial] = useState('')
  const { sensores, erro: erroSensores } = useSensores(serial)
  const [form, setForm] = useState({ tipoMaterial: '', sensorId: '', porta: '', dataInicio: '', dataFim: '' })
  const [filtros, setFiltros] = useState({ pagina: 0, tamanho: 100 })
  const { leituras, page, size, totalElements, totalPages, erro, carregando } = useLeituras(serial, filtros, 0)

  useEffect(() => { if (!serial && esteiras.length) setSerial(esteiras[0].numeroSerial) }, [esteiras, serial])
  const metalicas = leituras.filter((leitura) => leitura.tipoMaterial === 'METAL').length
  const plasticos = leituras.filter((leitura) => leitura.tipoMaterial === 'PLASTICO').length
  const onChange = (campo) => (event) => setForm((atual) => ({ ...atual, [campo]: event.target.value }))

  function aplicarFiltros(event) {
    event.preventDefault()
    setFiltros({
      pagina: 0,
      tamanho: 100,
      ...(form.tipoMaterial && { tipoMaterial: form.tipoMaterial }),
      ...(form.sensorId && { sensorId: form.sensorId }),
      ...(form.porta && { porta: form.porta }),
      ...(form.dataInicio && { dataInicio: paraIsoComOffset(form.dataInicio) }),
      ...(form.dataFim && { dataFim: paraIsoComOffset(form.dataFim) }),
    })
  }

  return <>
    <h1 className="fs-2">Histórico de leituras</h1>
    <p className="text-secondary">Filtros, datas e paginação são enviados à API. Cada página solicita no máximo 100 registros.</p>
    {(erroEsteiras || erroSensores || erro) && <div className="alert alert-warning">{erroEsteiras || erroSensores || erro}</div>}
    <div className="card p-3 mb-3">
      <form onSubmit={aplicarFiltros}>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4"><label htmlFor="esteira-historico" className="form-label">Esteira</label>
            <select id="esteira-historico" className="form-select" value={serial} onChange={(event) => { setSerial(event.target.value); setFiltros({ pagina: 0, tamanho: 100 }) }} disabled={carregandoEsteiras}>
              {!esteiras.length && <option value="">Nenhuma esteira cadastrada</option>}
              {esteiras.map((esteira) => <option key={esteira.id} value={esteira.numeroSerial}>{esteira.numeroSerial}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-4"><label htmlFor="material" className="form-label">Tipo de material</label>
            <select id="material" className="form-select" value={form.tipoMaterial} onChange={onChange('tipoMaterial')}>
              <option value="">Todos</option><option value="METAL">Metal</option><option value="PLASTICO">Plástico</option><option value="SEM_MATERIAL">Sem material</option><option value="DESCONHECIDO">Desconhecido</option>
            </select>
          </div>
          <div className="col-12 col-md-4"><label htmlFor="sensor" className="form-label">Sensor</label>
            <select id="sensor" className="form-select" value={form.sensorId} onChange={onChange('sensorId')}>
              <option value="">Todos</option>{sensores.map((sensor) => <option key={sensor.id} value={sensor.id}>Porta {sensor.porta} · {sensor.tipoSensor} · #{sensor.id}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-3"><label htmlFor="porta" className="form-label">Porta</label><input id="porta" type="number" min="1" step="1" className="form-control" value={form.porta} onChange={onChange('porta')} /></div>
          <div className="col-12 col-md-3"><label htmlFor="inicio" className="form-label">Data inicial</label><input id="inicio" type="datetime-local" className="form-control" value={form.dataInicio} onChange={onChange('dataInicio')} /></div>
          <div className="col-12 col-md-3"><label htmlFor="fim" className="form-label">Data final</label><input id="fim" type="datetime-local" className="form-control" value={form.dataFim} onChange={onChange('dataFim')} /></div>
          <div className="col-12 col-md-3 d-grid"><button className="btn btn-rm" disabled={!serial}>Aplicar filtros</button></div>
        </div>
      </form>
    </div>
    {serial && <>
      <p className="text-secondary">{carregando ? 'Consultando histórico…' : `${totalElements} resultado(s) · página ${totalPages ? page + 1 : 0} de ${totalPages}`}</p>
      <div className="row g-3 mb-3">
        <Resumo titulo="Leituras nesta página" valor={leituras.length} />
        <Resumo titulo="Metal nesta página" valor={metalicas} />
        <Resumo titulo="Plástico nesta página" valor={plasticos} />
        <Resumo titulo="Tamanho da página" valor={size} />
      </div>
      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
            <ProportionChart title="Materiais nesta página" metal={metalicas} other={leituras.length - metalicas} />
          </div>
        <div className="col-12 col-lg-6">
            <HourlyChart title="Leituras por hora" readings={leituras} />
          </div>
      </div>
      <div className="card p-3 table-responsive">
        <div className="d-flex justify-content-between align-items-center mb-2"><h2 className="fs-5 mb-0">Registros retornados</h2><button className="btn btn-outline-dark btn-sm" onClick={() => exportarCsv(leituras)} disabled={!leituras.length}>Exportar página CSV</button></div>
        <table className="table align-middle"><thead><tr><th>Data</th><th>ID</th><th>Sensor</th><th>Porta</th><th>Material</th><th>Modelo</th><th>Tipo de sensor</th><th>Hexadecimal</th></tr></thead>
          <tbody>{!leituras.length && <tr><td colSpan="8" className="text-secondary">Nenhuma leitura para os filtros selecionados.</td></tr>}
            {leituras.map((leitura, index) => <tr key={leitura.id ?? index}><td>{fmtData(leitura.horario)}</td><td>{leitura.id ?? '--'}</td><td>{leitura.sensorId ?? '--'}</td><td>{leitura.porta ?? '--'}</td><td>{leitura.tipoMaterial}</td><td>{leitura.modelo ?? '--'}</td><td>{leitura.tipoSensor ?? '--'}</td><td><code>{leitura.hexadecimal || '--'}</code></td></tr>)}
          </tbody>
        </table>
        <div className="d-flex justify-content-between align-items-center"><button className="btn btn-outline-secondary" onClick={() => setFiltros((atual) => ({ ...atual, pagina: Math.max(0, atual.pagina - 1) }))} disabled={page <= 0 || carregando}>Anterior</button><span className="text-secondary">{totalElements} registro(s)</span><button className="btn btn-outline-secondary" onClick={() => setFiltros((atual) => ({ ...atual, pagina: atual.pagina + 1 }))} disabled={page + 1 >= totalPages || carregando}>Próxima</button></div>
      </div>
    </>}
  </>
}

function Resumo({ titulo, valor }) {
  return <div className="col-6 col-md-3"><div className="card h-100 p-3"><div className="small text-secondary">{titulo}</div><div className="fs-3 fw-bold">{valor}</div></div></div>
}
