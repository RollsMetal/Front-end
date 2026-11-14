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

// Critério de alerta: Q3 + 1,5 × (Q3 − Q1)
export function limiteAlerta(v) {
  if (v.length < 4) return null
  const q1 = quartil(v, 0.25)
  const q3 = quartil(v, 0.75)
  return q3 + 1.5 * (q3 - q1)
}

export const fmt = (n, casas = 1) => (n === null || n === undefined || Number.isNaN(n) ? '--' : n.toFixed(casas))
export const fmtData = (d) => (d instanceof Date && !Number.isNaN(d.getTime()) ? d.toLocaleString('pt-BR') : '--')
