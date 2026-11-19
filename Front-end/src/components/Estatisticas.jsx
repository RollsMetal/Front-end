import { useMemo, useState } from 'react'
import { describe, describeProportion, fmt } from '../utils/estatisticas.js'
import { countReadingsByHour } from '../utils/leituras.js'

const DECIMAL_PLACES = 2
const EMPTY_VALUE = '--'

const formatModes = (modes) => (modes.length ? modes.join(', ') : 'Sem moda')
const formatInteger = (value) => fmt(value, 0)

// Cada linha da tabela: chave em describe(), rótulo e formatação opcional.
// Os grupos ficam aqui (e não no JSX) para incluir uma estatística nova em um só lugar.
const DESCRIPTIVE_GROUPS = [
  { title: 'Tendência central', rows: [
    { key: 'count', label: 'Quantidade (n)', format: formatInteger },
    { key: 'sum', label: 'Soma' },
    { key: 'mean', label: 'Média' },
    { key: 'median', label: 'Mediana' },
    { key: 'modes', label: 'Moda', format: formatModes },
    { key: 'geometricMean', label: 'Média geométrica' },
    { key: 'harmonicMean', label: 'Média harmônica' },
  ] },
  { title: 'Posição', rows: [
    { key: 'min', label: 'Mínimo' },
    { key: 'p10', label: 'Percentil 10' },
    { key: 'q1', label: '1º quartil (Q1)' },
    { key: 'q3', label: '3º quartil (Q3)' },
    { key: 'p90', label: 'Percentil 90' },
    { key: 'max', label: 'Máximo' },
  ] },
  { title: 'Dispersão', rows: [
    { key: 'range', label: 'Amplitude' },
    { key: 'iqr', label: 'Amplitude interquartil (IQR)' },
    { key: 'variance', label: 'Variância (amostral)' },
    { key: 'standardDeviation', label: 'Desvio padrão (amostral)' },
    { key: 'populationVariance', label: 'Variância (populacional)' },
    { key: 'populationStandardDeviation', label: 'Desvio padrão (populacional)' },
    { key: 'coefficientOfVariation', label: 'Coef. de variação (%)' },
    { key: 'meanAbsoluteDeviation', label: 'Desvio absoluto médio' },
    { key: 'medianAbsoluteDeviation', label: 'Desvio absoluto mediano' },
  ] },
  { title: 'Forma da distribuição', rows: [
    { key: 'skewness', label: 'Assimetria' },
    { key: 'kurtosis', label: 'Curtose (excesso)' },
  ] },
  { title: 'Inferência e outliers', rows: [
    { key: 'standardError', label: 'Erro padrão da média' },
    { key: 'ciLow', label: 'IC 95% da média (inferior)' },
    { key: 'ciHigh', label: 'IC 95% da média (superior)' },
    { key: 'lowerFence', label: 'Limite inferior (Tukey)' },
    { key: 'upperFence', label: 'Limite superior (Tukey)' },
    { key: 'outlierCount', label: 'Outliers', format: formatInteger },
  ] },
]

const PROPORTION_ROWS = [
  { key: 'total', label: 'Total de leituras', format: formatInteger },
  { key: 'successes', label: 'Metálicas', format: formatInteger },
  { key: 'failures', label: 'Não metálicas', format: formatInteger },
  { key: 'percentage', label: '% metálicas' },
  { key: 'proportion', label: 'Proporção (p)', digits: 4 },
  { key: 'variance', label: 'Variância p(1-p)', digits: 4 },
  { key: 'standardDeviation', label: 'Desvio padrão', digits: 4 },
  { key: 'standardError', label: 'Erro padrão de p', digits: 4 },
  { key: 'ciLowPercentage', label: 'IC 95% de p (inferior, %)' },
  { key: 'ciHighPercentage', label: 'IC 95% de p (superior, %)' },
  { key: 'oddsRatio', label: 'Razão metal : não metal' },
]

function formatCell(row, value) {
  if (value === null || value === undefined) return EMPTY_VALUE
  return row.format ? row.format(value) : fmt(value, row.digits ?? DECIMAL_PLACES)
}

/**
 * Card de gráfico com um painel de estatísticas que abre ao clicar no cabeçalho.
 * @param {string} title Título do gráfico.
 * @param {React.ReactNode} statistics Conteúdo do painel (tabela de estatísticas).
 * @param {React.ReactNode} children O gráfico em si.
 */
export function ChartCard({ title, statistics, children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card p-3 h-100">
      <button
        type="button"
        className="btn p-0 border-0 text-start d-flex justify-content-between align-items-center"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <h2 className="fs-5 mb-0">{title}</h2>
        <span className="small text-secondary">{open ? 'Ocultar estatísticas ▲' : 'Ver estatísticas ▼'}</span>
      </button>
      <div className="mt-2">{children}</div>
      {open && <div className="mt-3 border-top pt-3">{statistics}</div>}
    </div>
  )
}

/** Tabela com uma coluna por série; as linhas vêm de DESCRIPTIVE_GROUPS. */
function DescriptiveTable({ series }) {
  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle mb-0">
        <thead>
          <tr>
            <th scope="col">Estatística</th>
            {series.map((item) => <th scope="col" className="text-end" key={item.label}>{item.label}</th>)}
          </tr>
        </thead>
        {DESCRIPTIVE_GROUPS.map((group) => (
          <tbody key={group.title}>
            <tr className="table-light"><th colSpan={series.length + 1} className="small text-uppercase text-secondary">{group.title}</th></tr>
            {group.rows.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                {series.map((item) => <td className="text-end" key={item.label}>{formatCell(row, item.stats[row.key])}</td>)}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}

/**
 * Estatísticas do gráfico "Leituras por hora": total, metal e não metal por hora cheia.
 * @param {Array} readings Leituras normalizadas (as mesmas passadas ao gráfico).
 */
export function HourlyStatistics({ readings }) {
  const series = useMemo(() => {
    const hours = countReadingsByHour(readings)
    return [
      { label: 'Total', stats: describe(hours.map((h) => h.metal + h.other)) },
      { label: 'Metal', stats: describe(hours.map((h) => h.metal)) },
      { label: 'Não metal', stats: describe(hours.map((h) => h.other)) },
    ]
  }, [readings])

  if (!series[0].stats.count) return <p className="text-secondary mb-0">Sem dados para calcular estatísticas.</p>

  return (
    <>
      <p className="small text-secondary">Cada observação é a quantidade de leituras em uma hora (n = {series[0].stats.count} horas exibidas no gráfico).</p>
      <DescriptiveTable series={series} />
    </>
  )
}

/**
 * Estatísticas do gráfico de proporção de materiais.
 * @param {number} metal Leituras metálicas.
 * @param {number} other Leituras não metálicas.
 */
export function ProportionStatistics({ metal, other }) {
  const stats = useMemo(() => describeProportion(metal, metal + other), [metal, other])

  if (!stats) return <p className="text-secondary mb-0">Sem dados para calcular estatísticas.</p>

  return (
    <>
      <p className="small text-secondary">Intervalo de confiança pelo método de Wilson.</p>
      <div className="table-responsive">
        <table className="table table-sm align-middle mb-0">
          <tbody>
            {PROPORTION_ROWS.map((row) => (
              <tr key={row.key}><td>{row.label}</td><td className="text-end">{formatCell(row, stats[row.key])}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
