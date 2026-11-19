// Preparação dos dados das leituras para os gráficos e para as estatísticas.
// Fica separado de estatisticas.js porque aqui há conhecimento do domínio (leituras),
// enquanto lá só existem contas sobre números.

/** Quantidade de horas mais recentes exibidas no gráfico "Leituras por hora". */
export const HOURS_SHOWN = 12

/**
 * Conta as leituras por hora cheia, separando metálicas das demais.
 * O gráfico e o painel de estatísticas usam esta mesma função, então os números sempre batem.
 * @param {Array<{horario: Date, metalica: boolean}>} readings Leituras já normalizadas.
 * @param {number} [hoursShown] Quantas horas mais recentes manter.
 * @returns {Array<{hour: number, metal: number, other: number}>} Em ordem cronológica.
 */
export function countReadingsByHour(readings, hoursShown = HOURS_SHOWN) {
  const buckets = new Map()

  readings.forEach((reading) => {
    // setMinutes devolve o timestamp da hora cheia, ou NaN se a data for inválida
    const hour = new Date(reading.horario).setMinutes(0, 0, 0)
    if (Number.isNaN(hour)) return

    const bucket = buckets.get(hour) ?? { hour, metal: 0, other: 0 }
    if (reading.metalica) bucket.metal += 1
    else bucket.other += 1
    buckets.set(hour, bucket)
  })

  return [...buckets.values()].sort((a, b) => a.hour - b.hour).slice(-hoursShown)
}
