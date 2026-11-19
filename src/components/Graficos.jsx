import { limiteAlerta, quartil } from '../utils/estatisticas.js'
import { countReadingsByHour } from '../utils/leituras.js'

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

// Ativa o elemento com Enter/Espaço, para quem navega por teclado
const onActivateKey = (action) => (event) => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); action() }
}

// selecionado: 'metal' | 'other' | null; onSelecionar recebe a chave do lado clicado
export function Proporcao({ metalicas, naoMetalicas, selecionado = null, onSelecionar }) {
  const total = metalicas + naoMetalicas
  const wm = total ? ((x1 - x0) * metalicas) / total : 0
  const lado = (chave, x, largura, cor, rotulo) => (
    <rect
      className="chart-clickable chart-bar" role="button" tabIndex={0} aria-label={rotulo}
      x={x} y="60" width={largura} height="50" fill={cor}
      stroke={selecionado === chave ? '#14181f' : 'none'} strokeWidth="3"
      onClick={() => onSelecionar?.(chave)} onKeyDown={onActivateKey(() => onSelecionar?.(chave))}
    />
  )
  return (
    <Moldura vazio={!total}>
      {lado('metal', x0, wm, '#1d4ed8', `Metálicas: ${metalicas}`)}
      {lado('other', x0 + wm, x1 - x0 - wm, '#c2410c', `Não metálicas: ${naoMetalicas}`)}
      <text x={x0} y="50" fontSize="12" fill="#1d4ed8">Metálicas: {metalicas}</text>
      <text x={x1} y="50" fontSize="12" fill="#9a3412" textAnchor="end">Não metálicas: {naoMetalicas}</text>
    </Moldura>
  )
}

// Leituras por hora (empilhado): leituras = lista já normalizada (com horario e metalica)
// horaSelecionada: timestamp da hora destacada; onSelecionarHora recebe o timestamp da coluna clicada
export function PecasPorHora({ leituras, horaSelecionada = null, onSelecionarHora }) {
  const horas = countReadingsByHour(leituras)
  const max = Math.max(...horas.map((h) => h.metal + h.other), 1)
  const larg = Math.min((x1 - x0) / Math.max(horas.length, 1), 60)
  const alt = (n) => (n / max) * (y0 - y1)
  return (
    <Moldura vazio={!horas.length}>
      <text x="4" y={y1 + 4} fontSize="10" fill="#4b5563">{max}</text>
      <text x="14" y={y0} fontSize="10" fill="#4b5563">0</text>
      {horas.map((g, i) => {
        const selecionar = () => onSelecionarHora?.(g.hour)
        return (
          <g
            key={g.hour} className="chart-clickable" role="button" tabIndex={0}
            aria-label={`${new Date(g.hour).getHours()}h: ${g.metal + g.other} leituras`}
            onClick={selecionar} onKeyDown={onActivateKey(selecionar)}
          >
            {/* Área de clique cobrindo a coluna inteira, para barras baixas também serem fáceis de acertar */}
            <rect className={`chart-hit${horaSelecionada === g.hour ? ' is-selected' : ''}`} x={x0 + i * larg} y={y1} width={larg} height={y0 - y1} />
            <rect x={x0 + i * larg + 3} y={y0 - alt(g.metal)} width={larg - 6} height={alt(g.metal)} fill="#1d4ed8" />
            <rect x={x0 + i * larg + 3} y={y0 - alt(g.metal) - alt(g.other)} width={larg - 6} height={alt(g.other)} fill="#c2410c" />
            <text x={x0 + i * larg + larg / 2} y={H - 10} fontSize="9" textAnchor="middle" fill="#4b5563">{new Date(g.hour).getHours()}h</text>
          </g>
        )
      })}
    </Moldura>
  )
}
