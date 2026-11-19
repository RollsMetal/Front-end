const ordenar = (v) => [...v].sort((a, b) => a - b)

export function media(v) {
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null
}

export function quartil(v, q) {
  if (!v.length) return null
  const o = ordenar(v)
  const pos = (o.length - 1) * q
  const base = Math.floor(pos)
  const resto = pos - base
  return o[base + 1] !== undefined ? o[base] + resto * (o[base + 1] - o[base]) : o[base]
}

export const mediana = (v) => quartil(v, 0.5)

export function moda(v) {
  if (!v.length) return null
  const cont = {}
  v.forEach((x) => { const k = Math.round(x); cont[k] = (cont[k] || 0) + 1 })
  return Number(Object.keys(cont).sort((a, b) => cont[b] - cont[a])[0])
}

export function desvioPadrao(v) {
  if (v.length < 2) return null
  const m = media(v)
  return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1))
}

export const minimo = (v) => (v.length ? Math.min(...v) : null)
export const maximo = (v) => (v.length ? Math.max(...v) : null)
export const variancia = (v) => (v.length < 2 ? null : desvioPadrao(v) ** 2)

export function coefVariacao(v) {
  const m = media(v)
  const d = desvioPadrao(v)
  return m && d !== null ? (d / m) * 100 : null
}

// Distribuição de frequências do nível (0-100%) em classes de 10 em 10
export function distribuicao(v) {
  const fi = Array(10).fill(0)
  v.forEach((x) => { fi[Math.min(9, Math.max(0, Math.floor(x / 10)))]++ })
  let acum = 0
  return fi.map((f, i) => {
    acum += f
    return { classe: `${i * 10} |- ${(i + 1) * 10}`, fi: f, fr: v.length ? (f / v.length) * 100 : 0, fac: acum }
  })
}

// Critério de alerta: Q3 + 1,5 × (Q3 − Q1)
export function limiteAlerta(v) {
  if (v.length < 4) return null
  const q1 = quartil(v, 0.25)
  const q3 = quartil(v, 0.75)
  return q3 + 1.5 * (q3 - q1)
}

export const fmt = (n, casas = 1) => (n === null || n === undefined || Number.isNaN(n) ? '--' : n.toFixed(casas))
export const fmtData = (d) => (d instanceof Date && !Number.isNaN(d.getTime()) ? d.toLocaleString('pt-BR') : '--')

// ---------------------------------------------------------------------------
// Estatística descritiva completa (usada pelos painéis dos gráficos)
// ---------------------------------------------------------------------------

const MIN_SAMPLE_FOR_SKEWNESS = 3
const MIN_SAMPLE_FOR_KURTOSIS = 4
const MIN_SAMPLE_FOR_FENCES = 4
const IQR_FENCE_MULTIPLIER = 1.5
const Z_SCORE_95 = 1.96
const LOW_PERCENTILE = 0.1
const HIGH_PERCENTILE = 0.9

// t de Student bicaudal 95% para 1..30 graus de liberdade.
// Com amostras pequenas (ex.: 12 horas) o z de 1,96 deixaria o intervalo estreito demais.
const T_CRITICAL_95 = [
  12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228,
  2.201, 2.179, 2.16, 2.145, 2.131, 2.12, 2.11, 2.101, 2.093, 2.086,
  2.08, 2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042,
]

const sumOf = (values) => values.reduce((total, x) => total + x, 0)
const allPositive = (values) => values.length > 0 && values.every((x) => x > 0)

/** Valor crítico t (95%) para `degreesOfFreedom`; acima de 30 usa a aproximação normal. */
function criticalValue95(degreesOfFreedom) {
  return T_CRITICAL_95[degreesOfFreedom - 1] ?? Z_SCORE_95
}

/** Média de (x - média)^power — base para assimetria e curtose. */
function centralMoment(values, power) {
  const mean = media(values)
  return values.reduce((total, x) => total + (x - mean) ** power, 0) / values.length
}

/**
 * Todas as modas de uma lista numérica.
 * @param {number[]} values
 * @returns {number[]} Valores mais frequentes; [] quando nenhum valor se repete (amodal).
 */
export function findModes(values) {
  const counts = new Map()
  values.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1))
  const highest = Math.max(0, ...counts.values())
  if (highest <= 1) return []
  return [...counts].filter(([, count]) => count === highest).map(([x]) => x).sort((a, b) => a - b)
}

/** Assimetria (Fisher-Pearson ajustada, G1). Exige n >= 3 e variação > 0. */
export function skewness(values) {
  const n = values.length
  const m2 = centralMoment(values, 2)
  if (n < MIN_SAMPLE_FOR_SKEWNESS || m2 === 0) return null
  return (centralMoment(values, 3) / m2 ** 1.5) * (Math.sqrt(n * (n - 1)) / (n - 2))
}

/** Curtose em excesso (G2, normal = 0). Exige n >= 4 e variação > 0. */
export function kurtosis(values) {
  const n = values.length
  const m2 = centralMoment(values, 2)
  if (n < MIN_SAMPLE_FOR_KURTOSIS || m2 === 0) return null
  const excess = centralMoment(values, 4) / m2 ** 2 - 3
  return ((n - 1) / ((n - 2) * (n - 3))) * ((n + 1) * excess + 6)
}

/** Desvio absoluto médio em torno da média. */
export function meanAbsoluteDeviation(values) {
  if (!values.length) return null
  const mean = media(values)
  return media(values.map((x) => Math.abs(x - mean)))
}

/** Desvio absoluto mediano (MAD): resistente a outliers. */
export function medianAbsoluteDeviation(values) {
  if (!values.length) return null
  const center = mediana(values)
  return mediana(values.map((x) => Math.abs(x - center)))
}

/** Média geométrica; só existe para valores estritamente positivos. */
export function geometricMean(values) {
  if (!allPositive(values)) return null
  return Math.exp(media(values.map(Math.log)))
}

/** Média harmônica; só existe para valores estritamente positivos. */
export function harmonicMean(values) {
  if (!allPositive(values)) return null
  return values.length / sumOf(values.map((x) => 1 / x))
}

/**
 * Resumo estatístico completo de uma amostra numérica.
 * Campos que não podem ser calculados (amostra pequena demais, divisão por zero) vêm como null.
 * @param {number[]} values
 * @returns {Object} Medidas de tendência central, posição, dispersão, forma e intervalo de confiança.
 */
export function describe(values) {
  const n = values.length
  const mean = media(values)
  const sd = desvioPadrao(values)
  const q1 = quartil(values, 0.25)
  const q3 = quartil(values, 0.75)
  const iqr = n ? q3 - q1 : null
  const standardError = sd === null ? null : sd / Math.sqrt(n)
  const margin = standardError === null ? null : criticalValue95(n - 1) * standardError
  const hasFences = n >= MIN_SAMPLE_FOR_FENCES
  const lowerFence = hasFences ? q1 - IQR_FENCE_MULTIPLIER * iqr : null
  const upperFence = hasFences ? q3 + IQR_FENCE_MULTIPLIER * iqr : null

  return {
    count: n,
    sum: n ? sumOf(values) : null,
    mean,
    median: mediana(values),
    modes: findModes(values),
    geometricMean: geometricMean(values),
    harmonicMean: harmonicMean(values),
    min: minimo(values),
    max: maximo(values),
    range: n ? maximo(values) - minimo(values) : null,
    p10: quartil(values, LOW_PERCENTILE),
    q1,
    q3,
    p90: quartil(values, HIGH_PERCENTILE),
    iqr,
    variance: variancia(values),
    standardDeviation: sd,
    populationVariance: n ? centralMoment(values, 2) : null,
    populationStandardDeviation: n ? Math.sqrt(centralMoment(values, 2)) : null,
    coefficientOfVariation: mean && sd !== null ? (sd / mean) * 100 : null,
    standardError,
    meanAbsoluteDeviation: meanAbsoluteDeviation(values),
    medianAbsoluteDeviation: medianAbsoluteDeviation(values),
    skewness: skewness(values),
    kurtosis: kurtosis(values),
    ciLow: margin === null ? null : mean - margin,
    ciHigh: margin === null ? null : mean + margin,
    lowerFence,
    upperFence,
    outlierCount: hasFences ? values.filter((x) => x < lowerFence || x > upperFence).length : null,
  }
}

/**
 * Estatísticas de uma proporção (ex.: leituras metálicas / total).
 * O intervalo usa o método de Wilson, que se comporta bem com amostras pequenas e p perto de 0 ou 1.
 * @param {number} successes Quantidade de ocorrências do evento.
 * @param {number} total Tamanho da amostra.
 * @returns {Object} Proporção, percentual, variância, erro padrão, intervalo de confiança e razão.
 */
export function describeProportion(successes, total) {
  if (!total) return null
  const p = successes / total
  const failures = total - successes
  const z2 = Z_SCORE_95 ** 2
  const denominator = 1 + z2 / total
  const center = (p + z2 / (2 * total)) / denominator
  const margin = (Z_SCORE_95 * Math.sqrt((p * (1 - p)) / total + z2 / (4 * total ** 2))) / denominator

  return {
    total,
    successes,
    failures,
    proportion: p,
    percentage: p * 100,
    variance: p * (1 - p),
    standardDeviation: Math.sqrt(p * (1 - p)),
    standardError: Math.sqrt((p * (1 - p)) / total),
    ciLowPercentage: (center - margin) * 100,
    ciHighPercentage: (center + margin) * 100,
    oddsRatio: failures ? successes / failures : null,
  }
}

/**
 * Situa uma observação dentro da amostra (usado ao clicar em uma barra do gráfico).
 * @param {number[]} values Amostra completa (inclui a observação).
 * @param {number} value A observação clicada.
 * @returns {Object|null} Desvio da média/mediana, z-score, posição no ranking, percentil e se é outlier.
 */
export function describeObservation(values, value) {
  if (!values.length) return null
  const n = values.length
  const mean = media(values)
  const sd = desvioPadrao(values)
  const q1 = quartil(values, 0.25)
  const q3 = quartil(values, 0.75)
  const hasFences = n >= MIN_SAMPLE_FOR_FENCES
  const lowerFence = q1 - IQR_FENCE_MULTIPLIER * (q3 - q1)
  const upperFence = q3 + IQR_FENCE_MULTIPLIER * (q3 - q1)

  return {
    value,
    mean,
    deviationFromMean: value - mean,
    deviationFromMedian: value - mediana(values),
    zScore: sd ? (value - mean) / sd : null,
    // posição 1 = maior valor; empates dividem a mesma posição
    rank: values.filter((x) => x > value).length + 1,
    sampleSize: n,
    percentileRank: (values.filter((x) => x <= value).length / n) * 100,
    isOutlier: hasFences ? value < lowerFence || value > upperFence : null,
  }
}
