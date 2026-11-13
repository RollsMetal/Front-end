// ============================================================
// ÁREA DO BACK-END: é só aqui que você mexe para ligar a API
// ============================================================

// Endereço da API (pode mudar no arquivo .env: VITE_API_URL)
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Rota que devolve as leituras da esteira
const ROTA_LEITURAS = "/leituras";

// Converte cada item que vem do back-end para o formato que o front usa.
// Se os nomes dos campos do Spring Boot forem diferentes, ajuste aqui.
// Formato do front:
// { id, horario (ISO), tipo: "METALICA" | "NAO_METALICA",
//   sensor: "INDUTIVO" | "CAPACITIVO", nivel (0 a 100, IO-Link), distanciaMm }
function adaptarLeitura(item) {
  return {
    id: item.id,
    horario: item.horario,
    tipo: item.tipo,
    sensor: item.sensor,
    nivel: Number(item.nivel),
    distanciaMm: Number(item.distanciaMm),
  };
}

// Busca as leituras. Sem API (ou com erro), tudo fica zerado.
export async function buscarLeituras() {
  try {
    const resposta = await fetch(API_URL + ROTA_LEITURAS);
    if (!resposta.ok) throw new Error("Erro na API");
    const dados = await resposta.json();
    return { dados: dados.map(adaptarLeitura), offline: false };
  } catch (erro) {
    return { dados: [], offline: true };
  }
}
