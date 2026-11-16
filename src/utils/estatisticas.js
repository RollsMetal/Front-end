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
