import { useState } from 'react'
import { useLeituras } from '../hooks.js'
import { BoxPlot, Histograma, LinhaNivel, PecasPorHora, Proporcao } from '../components/Graficos.jsx'
import { coefVariacao, desvioPadrao, distribuicao, fmt, fmtData, limiteAlerta, maximo, media, mediana, minimo, moda, quartil, variancia } from '../utils/estatisticas.js'

const PERIODOS = { 'Última hora': 1, 'Últimas 24 horas': 24, 'Últimos 7 dias': 168, 'Todo o período': Infinity }

function exportarCsv(lista) {
  const linhas = lista.map((l) => [fmtData(l.horario), l.id ?? '', l.metalica ? 'Metálica' : 'Não metálica', l.sensor, String(l.nivel).replace('.', ',')].join(';'))
  const csv = '\uFEFF' + ['Horário;Peça;Tipo;Sensor;Nível (%)', ...linhas].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = 'leituras-rollsmetal.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}

function Stat({ nome, valor }) {
  return (
    <div className="col-6 col-md-4 col-xl-2">
      <div className="card p-3"><div className="small text-secondary">{nome}</div><div className="fs-3 fw-bold">{valor}</div></div>
    </div>
  )
}

export default function Historico() {
  const { leituras, erro } = useLeituras(10000)
  const [form, setForm] = useState({ tipo: 'Todas', sensor: 'Todos', periodo: 'Última hora' })
  const [filtro, setFiltro] = useState(form)

  const agora = Date.now()
  const lista = leituras.filter((l) => {
    if (filtro.tipo === 'Metálica' && !l.metalica) return false
    if (filtro.tipo === 'Não metálica' && l.metalica) return false
    if (filtro.sensor !== 'Todos' && l.sensor !== filtro.sensor) return false
    return agora - l.horario.getTime() <= PERIODOS[filtro.periodo] * 3600000
  })
  const niveis = lista.map((l) => l.nivel).filter((n) => !Number.isNaN(n))
  const lim = limiteAlerta(niveis)
  const outliers = lim === null ? null : niveis.filter((n) => n > lim).length
  const met = lista.filter((l) => l.metalica).length
  const campo = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <>
      <h1 className="fs-2">Histórico de dados</h1>
      <p className="text-secondary">Leituras dos sensores indutivo e capacitivo, com análise estatística do nível do reservatório</p>
      {erro && <div className="alert alert-warning">{erro}</div>}

      <div className="card p-3 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md">
            <label htmlFor="tipo" className="form-label">Tipo de peça</label>
            <select id="tipo" className="form-select" value={form.tipo} onChange={campo('tipo')}>
              <option>Todas</option><option>Metálica</option><option>Não metálica</option>
            </select>
          </div>
          <div className="col-12 col-md">
            <label htmlFor="sensor" className="form-label">Sensor</label>
            <select id="sensor" className="form-select" value={form.sensor} onChange={campo('sensor')}>
              <option>Todos</option><option>Indutivo</option><option>Capacitivo</option>
            </select>
          </div>
          <div className="col-12 col-md">
            <label htmlFor="periodo" className="form-label">Período</label>
            <select id="periodo" className="form-select" value={form.periodo} onChange={campo('periodo')}>
              {Object.keys(PERIODOS).map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-auto">
            <button className="btn btn-rm" onClick={() => setFiltro(form)}>Aplicar filtros</button>
          </div>
        </div>
      </div>

      <h2 className="fs-4">Estatística descritiva: nível do reservatório</h2>
      <div className="row g-3 mb-4">
        <Stat nome="Média" valor={fmt(media(niveis))} />
        <Stat nome="Mediana" valor={fmt(mediana(niveis))} />
        <Stat nome="Moda" valor={fmt(moda(niveis), 0)} />
        <Stat nome="Desvio padrão" valor={fmt(desvioPadrao(niveis))} />
        <Stat nome="Quartil 1 (Q1)" valor={fmt(quartil(niveis, 0.25))} />
        <Stat nome="Quartil 3 (Q3)" valor={fmt(quartil(niveis, 0.75))} />
        <Stat nome="Mínimo" valor={fmt(minimo(niveis))} />
        <Stat nome="Máximo" valor={fmt(maximo(niveis))} />
        <Stat nome="Amplitude" valor={fmt(maximo(niveis) === null ? null : maximo(niveis) - minimo(niveis))} />
        <Stat nome="Variância" valor={fmt(variancia(niveis))} />
        <Stat nome="Coef. de variação" valor={`${fmt(coefVariacao(niveis))}%`} />
        <Stat nome="P10 / P90" valor={`${fmt(quartil(niveis, 0.1), 0)} / ${fmt(quartil(niveis, 0.9), 0)}`} />
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-6"><div className="card p-3"><h3 className="fs-5">Nível ao longo do tempo</h3><LinhaNivel valores={[...niveis].reverse()} /></div></div>
        <div className="col-12 col-lg-6"><div className="card p-3"><h3 className="fs-5">Histograma do nível</h3><Histograma valores={niveis} /></div></div>
        <div className="col-12 col-lg-6"><div className="card p-3"><h3 className="fs-5">Boxplot do nível</h3><BoxPlot valores={niveis} /></div></div>
        <div className="col-12 col-lg-6"><div className="card p-3"><h3 className="fs-5">Metálicas x não metálicas</h3><Proporcao metalicas={met} naoMetalicas={lista.length - met} /></div></div>
        <div className="col-12"><div className="card p-3"><h3 className="fs-5">Peças por hora (azul: metálicas, laranja: não metálicas)</h3><PecasPorHora leituras={lista} /></div></div>
      </div>

      <div className="card p-3 mb-4 table-responsive">
        <h3 className="fs-5">Distribuição de frequências do nível</h3>
        <table className="table table-sm align-middle mb-0">
          <thead><tr><th>Classe (%)</th><th>Frequência (fi)</th><th>Frequência relativa (fr)</th><th>Freq. acumulada (Fac)</th></tr></thead>
          <tbody>
            {distribuicao(niveis).map((c) => (
              <tr key={c.classe}><td>{c.classe}</td><td>{c.fi}</td><td>{fmt(c.fr)}%</td><td>{c.fac}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-3 mb-4">
        <h3 className="fs-5">Outliers e critério de alerta</h3>
        <p className="mb-0 text-secondary">
          Critério: alerta quando o nível ficar acima de Q3 + 1,5 × (Q3 − Q1). Limite calculado: {fmt(lim)}%. Outliers encontrados: {outliers ?? '--'}.
        </p>
      </div>

      <div className="card p-3 table-responsive">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3 className="fs-5 mb-0">Leituras registradas</h3>
          <button className="btn btn-outline-dark btn-sm" onClick={() => exportarCsv(lista)} disabled={!lista.length}>Exportar CSV</button>
        </div>
        <table className="table align-middle">
          <thead>
            <tr><th>Horário</th><th>Peça</th><th>Tipo</th><th>Sensor</th><th>Nível do reservatório</th></tr>
          </thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan="5" className="text-secondary">Nenhuma leitura para os filtros selecionados.</td></tr>}
            {lista.map((l, i) => (
              <tr key={l.id ?? i}>
                <td>{fmtData(l.horario)}</td>
                <td>{l.id ? `#${l.id}` : '--'}</td>
                <td><span className={`badge rounded-pill ${l.metalica ? 'badge-metalica' : 'badge-naometalica'}`}>{l.metalica ? 'Metálica' : 'Não metálica'}</span></td>
                <td>{l.sensor}</td>
                <td>{fmt(l.nivel)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
