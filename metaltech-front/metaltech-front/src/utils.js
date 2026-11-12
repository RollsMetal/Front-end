// Funções de apoio usadas em várias telas

export function estatisticas(valores) {
  const v = [...valores].sort((a, b) => a - b);
  const n = v.length;
  if (n === 0) return null;

  const media = v.reduce((soma, x) => soma + x, 0) / n;

  function percentil(p) {
    const pos = (n - 1) * p;
    const base = Math.floor(pos);
    const resto = pos - base;
    if (v[base + 1] === undefined) return v[base];
    return v[base] + resto * (v[base + 1] - v[base]);
  }

  const contagem = {};
  v.forEach((x) => {
    const chave = Math.round(x);
    contagem[chave] = (contagem[chave] || 0) + 1;
  });
  const moda = Number(Object.keys(contagem).sort((a, b) => contagem[b] - contagem[a])[0]);

  const desvio = Math.sqrt(v.reduce((soma, x) => soma + (x - media) ** 2, 0) / n);
  const q1 = percentil(0.25);
  const q3 = percentil(0.75);
  const limiteSuperior = q3 + 1.5 * (q3 - q1);
  const limiteInferior = q1 - 1.5 * (q3 - q1);

  return {
    media,
    mediana: percentil(0.5),
    moda,
    desvio,
    q1,
    q3,
    min: v[0],
    max: v[n - 1],
    limiteSuperior,
    limiteInferior,
    outliers: v.filter((x) => x > limiteSuperior || x < limiteInferior),
  };
}

export function formatarHora(iso) {
  return new Date(iso).toLocaleTimeString("pt-BR");
}

export function formatarNumero(n) {
  return Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

// Sensor fica "online" se tiver leitura no último minuto
export function statusSensores(leituras) {
  const agora = Date.now();
  function ultimaLeitura(filtro) {
    const achada = [...leituras].reverse().find(filtro);
    return achada ? new Date(achada.horario).getTime() : 0;
  }
  const ultima = leituras[leituras.length - 1];
  const tIndutivo = ultimaLeitura((l) => l.sensor === "INDUTIVO");
  const tCapacitivo = ultimaLeitura((l) => l.sensor === "CAPACITIVO");
  const tIoLink = ultima ? new Date(ultima.horario).getTime() : 0;

  return [
    { nome: "Indutivo", online: agora - tIndutivo < 60000, ultima: tIndutivo },
    { nome: "Capacitivo", online: agora - tCapacitivo < 60000, ultima: tCapacitivo },
    { nome: "IO-Link", online: agora - tIoLink < 60000, ultima: tIoLink },
  ];
}

// Configurações e perfil ficam no localStorage
const CONFIG_PADRAO = { esteira: "Esteira de Triagem 01", limite: 85, mestre: "", porta: 1 };
const PERFIL_PADRAO = { nome: "", email: "", acesso: "Operador" };

function ler(chave, padrao) {
  try {
    return { ...padrao, ...JSON.parse(localStorage.getItem(chave)) };
  } catch {
    return padrao;
  }
}

export const pegarConfig = () => ler("config", CONFIG_PADRAO);
export const salvarConfig = (c) => localStorage.setItem("config", JSON.stringify(c));
export const pegarPerfil = () => ler("perfil", PERFIL_PADRAO);
export const salvarPerfil = (p) => localStorage.setItem("perfil", JSON.stringify(p));

// Usado nas Análises enquanto não há leituras
export const ESTATISTICAS_ZERADAS = {
  media: 0, mediana: 0, moda: 0, desvio: 0, q1: 0, q3: 0, min: 0, max: 0,
  limiteSuperior: 0, limiteInferior: 0, outliers: [],
};
