import { useMemo, useState } from 'react'
import { describe, describeObservation, describeProportion, fmt } from '../utils/estatisticas.js'
import { countReadingsByHour } from '../utils/leituras.js'
import { PecasPorHora, Proporcao } from './Graficos.jsx'

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
  { key: 'successes', label: 'Leituras desta categoria', format: formatInteger },
  { key: 'failures', label: 'Leituras das demais', format: formatInteger },
  { key: 'percentage', label: '% desta categoria' },
  { key: 'proportion', label: 'Proporção (p)', digits: 4 },
  { key: 'variance', label: 'Variância p(1-p)', digits: 4 },
  { key: 'standardDeviation', label: 'Desvio padrão', digits: 4 },
  { key: 'standardError', label: 'Erro padrão de p', digits: 4 },
  { key: 'ciLowPercentage', label: 'IC 95% de p (inferior, %)' },
  { key: 'ciHighPercentage', label: 'IC 95% de p (superior, %)' },
  { key: 'oddsRatio', label: 'Razão categoria : demais' },
]

const HOUR_LABEL_OPTIONS = { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }
const formatHour = (timestamp) => new Date(timestamp).toLocaleString('pt-BR', HOUR_LABEL_OPTIONS)
const formatYesNo = (value) => (value === null ? EMPTY_VALUE : value ? 'Sim' : 'Não')

function formatCell(row, value) {
  if (value === null || value === undefined) return EMPTY_VALUE
  return row.format ? row.format(value) : fmt(value, row.digits ?? DECIMAL_PLACES)
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

/** Painel que abre abaixo do gráfico quando uma barra é clicada. */
function DetailsPanel({ title, onClose, children }) {
  return (
    <div className="mt-3 border-top pt-3">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h3 className="fs-6 mb-0">{title}</h3>
        <button type="button" className="btn-close" aria-label="Fechar estatísticas" onClick={onClose} />
      </div>
      {children}
    </div>
  )
}

function KeyValueTable({ rows }) {
  return (
    <div className="table-responsive">
      <table className="table table-sm align-middle mb-0">
        <tbody>
          {rows.map(([label, value]) => <tr key={label}><td>{label}</td><td className="text-end">{value}</td></tr>)}
        </tbody>
      </table>
    </div>
  )
}

/** Linhas que situam a hora clicada dentro das demais horas do gráfico. */
function buildHourRows(selected, totals) {
  const total = selected.metal + selected.other
  const observation = describeObservation(totals, total)
  return [
    ['Leituras metálicas', selected.metal],
    ['Leituras não metálicas', selected.other],
    ['Total na hora', total],
    ['% metálicas na hora', fmt(total ? (selected.metal / total) * 100 : null)],
    ['Média de leituras por hora', fmt(observation.mean)],
    ['Diferença para a média', fmt(observation.deviationFromMean)],
    ['Diferença para a mediana', fmt(observation.deviationFromMedian)],
    ['Z-score', fmt(observation.zScore)],
    ['Posição no ranking (1 = mais leituras)', `${observation.rank}º de ${observation.sampleSize}`],
    ['Percentil', fmt(observation.percentileRank)],
    ['Outlier (critério de Tukey)', formatYesNo(observation.isOutlier)],
  ]
}

/**
 * Gráfico "Leituras por hora". Clicar em uma barra mostra as estatísticas daquela hora
 * e, logo abaixo, as estatísticas completas de todas as horas do gráfico.
 * @param {string} title Título do card.
 * @param {Array} readings Leituras normalizadas.
 */
export function HourlyChart({ title, readings }) {
  const [selectedHour, setSelectedHour] = useState(null)
  const hours = useMemo(() => countReadingsByHour(readings), [readings])
  // Se a hora clicada sair do gráfico (dados atualizados), o painel fecha sozinho
  const selected = hours.find((h) => h.hour === selectedHour) ?? null
  const toggle = (hour) => setSelectedHour((current) => (current === hour ? null : hour))

  const series = useMemo(() => [
    { label: 'Total', stats: describe(hours.map((h) => h.metal + h.other)) },
    { label: 'Metal', stats: describe(hours.map((h) => h.metal)) },
    { label: 'Não metal', stats: describe(hours.map((h) => h.other)) },
  ], [hours])

  return (
    <div className="card p-3 h-100">
      <h2 className="fs-5">{title}</h2>
      <PecasPorHora leituras={readings} horaSelecionada={selectedHour} onSelecionarHora={toggle} />
      <p className="small text-secondary mb-0">Clique em uma barra para ver as estatísticas.</p>
      {selected && (
        <DetailsPanel title={`Hora ${formatHour(selected.hour)}`} onClose={() => setSelectedHour(null)}>
          <KeyValueTable rows={buildHourRows(selected, hours.map((h) => h.metal + h.other))} />
          <h3 className="fs-6 mt-3">Estatísticas de todas as horas do gráfico (n = {hours.length})</h3>
          <DescriptiveTable series={series} />
        </DetailsPanel>
      )}
    </div>
  )
}

const PROPORTION_SIDES = {
  metal: { title: 'Metálicas', pick: (metal) => metal },
  other: { title: 'Não metálicas', pick: (metal, other) => other },
}

/**
 * Gráfico de proporção de materiais. Clicar em um dos lados mostra as estatísticas dele.
 * @param {string} title Título do card.
 * @param {number} metal Leituras metálicas.
 * @param {number} other Leituras não metálicas.
 */
export function ProportionChart({ title, metal, other }) {
  const [side, setSide] = useState(null)
  const toggle = (clicked) => setSide((current) => (current === clicked ? null : clicked))
  const stats = useMemo(
    () => (side ? describeProportion(PROPORTION_SIDES[side].pick(metal, other), metal + other) : null),
    [side, metal, other],
  )

  return (
    <div className="card p-3 h-100">
      <h2 className="fs-5">{title}</h2>
      <Proporcao metalicas={metal} naoMetalicas={other} selecionado={side} onSelecionar={toggle} />
      <p className="small text-secondary mb-0">Clique em uma barra para ver as estatísticas.</p>
      {stats && (
        <DetailsPanel title={`Estatísticas: ${PROPORTION_SIDES[side].title}`} onClose={() => setSide(null)}>
          <p className="small text-secondary">Intervalo de confiança pelo método de Wilson.</p>
          <KeyValueTable rows={PROPORTION_ROWS.map((row) => [row.label, formatCell(row, stats[row.key])])} />
        </DetailsPanel>
      )}
    </div>
  )
}
