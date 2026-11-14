export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function entrar(email, senha) {
  const r = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  })
  if (!r.ok) throw new Error('Credenciais inválidas')
  return r.json() // esperado: { token: "..." }
}

export async function listarLeituras() {
  const r = await fetch(`${API_URL}/leituras`)
  if (!r.ok) throw new Error('Falha ao buscar leituras')
  return r.json()
}

// Aceita pequenas variações de nome de campo vindas do back-end
export function normalizar(l) {
  const tipo = String(l.tipo ?? l.tipoPeca ?? '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const metalica = tipo.includes('METAL') && !tipo.includes('NAO')
  return {
    id: l.id,
    horario: new Date(l.horario ?? l.dataHora ?? l.timestamp),
    metalica,
    sensor: metalica ? 'Indutivo' : 'Capacitivo',
    nivel: Number(l.nivelReservatorio ?? l.nivel),
  }
}
