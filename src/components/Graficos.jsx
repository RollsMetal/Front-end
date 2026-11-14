import { limiteAlerta, quartil } from '../utils/estatisticas.js'

const W = 400, H = 180, PL = 34, PR = 10, PT = 10, PB = 30
const x0 = PL, x1 = W - PR, y0 = H - PB, y1 = PT
const escY = (v) => y0 - (v / 100) * (y0 - y1)
const escX = (v) => x0 + (v / 100) * (x1 - x0)

function Moldura({ children, vazio }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" className="w-100" style={{ height: 'auto' }}>
      <line x1={x0} y1={y1} x2={x0} y2={y0} stroke="#9ca3af" />
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke="#9ca3af" />
      {vazio
        ? <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="13" fill="#4b5563">Aguardando dados da API</text>
        : children}
    </svg>
  )
}

export function LinhaNivel({ valores }) {
  const n = valores.length
  const pontos = valores.map((v, i) => `${x0 + (i * (x1 - x0)) / (n - 1)},${escY(v)}`).join(' ')
  return (
    <Moldura vazio={n < 2}>
      <text x="4" y={escY(100) + 4} fontSize="10" fill="#4b5563">100%</text>
      <text x="14" y={escY(0)} fontSize="10" fill="#4b5563">0</text>
      <polyline points={pontos} fill="none" stroke="#c2410c" strokeWidth="2" />
    </Moldura>
  )
}

export function Histograma({ valores }) {
  const bins = Array(10).fill(0)
  valores.forEach((v) => { bins[Math.min(9, Math.max(0, Math.floor(v / 10)))]++ })
  const max = Math.max(...bins, 1)
  const larg = (x1 - x0) / 10
  return (
    <Moldura vazio={!valores.length}>
      {bins.map((c, i) => {
        const h = (c / max) * (y0 - y1)
        return <rect key={i} x={x0 + i * larg + 2} y={y0 - h} width={larg - 4} height={h} fill="#14181f" />
      })}
      <text x={x0} y={H - 10} fontSize="10" fill="#4b5563">0%</text>
      <text x={x1 - 24} y={H - 10} fontSize="10" fill="#4b5563">100%</text>
    </Moldura>
  )
}

export function BoxPlot({ valores }) {
  const q1 = quartil(valores, 0.25), q2 = quartil(valores, 0.5), q3 = quartil(valores, 0.75)
  const lim = limiteAlerta(valores)
  const dentro = valores.filter((v) => lim === null || v <= lim)
  const max = dentro.length ? Math.max(...dentro) : null
  const min = valores.length ? Math.min(...valores) : null
  const out = valores.filter((v) => lim !== null && v > lim)
  const cy = (y0 + y1) / 2
  return (
    <Moldura vazio={valores.length < 4}>
      <line x1={escX(min)} y1={cy} x2={escX(max)} y2={cy} stroke="#14181f" />
      <rect x={escX(q1)} y={cy - 22} width={Math.max(escX(q3) - escX(q1), 1)} height="44" fill="#fdba74" stroke="#14181f" />
      <line x1={escX(q2)} y1={cy - 22} x2={escX(q2)} y2={cy + 22} stroke="#14181f" strokeWidth="2" />
      {out.map((v, i) => <circle key={i} cx={escX(v)} cy={cy} r="4" fill="#b91c1c" />)}
      <text x={x0} y={H - 10} fontSize="10" fill="#4b5563">0%</text>
      <text x={x1 - 24} y={H - 10} fontSize="10" fill="#4b5563">100%</text>
    </Moldura>
  )
}

export function Proporcao({ metalicas, naoMetalicas }) {
  const total = metalicas + naoMetalicas
  const wm = total ? ((x1 - x0) * metalicas) / total : 0
  return (
    <Moldura vazio={!total}>
      <rect x={x0} y="60" width={wm} height="50" fill="#1d4ed8" />
      <rect x={x0 + wm} y="60" width={x1 - x0 - wm} height="50" fill="#c2410c" />
      <text x={x0} y="50" fontSize="12" fill="#1d4ed8">Metálicas: {metalicas}</text>
      <text x={x1} y="50" fontSize="12" fill="#9a3412" textAnchor="end">Não metálicas: {naoMetalicas}</text>
    </Moldura>
  )
}
