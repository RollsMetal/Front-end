const baseUrl = (process.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')
const browserOrigin = process.env.FE_ORIGIN || 'http://localhost:5173'
const failures = []

async function get(path, check) {
  const url = `${baseUrl}${path}`
  try {
    const response = await fetch(url, { headers: { Origin: browserOrigin } })
    const body = await response.json().catch(() => null)
    const cors = response.headers.get('access-control-allow-origin')
    const corsOk = cors === '*' || cors === browserOrigin
    console.log(`${response.status} ${path}${corsOk ? ' · CORS OK' : ` · CORS sem permissão para ${browserOrigin}`}`)
    if (!response.ok) failures.push(`${path}: HTTP ${response.status} ${body?.message || ''}`)
    if (!corsOk) failures.push(`${path}: resposta sem Access-Control-Allow-Origin válido para ${browserOrigin}`)
    if (response.ok && check && !check(body)) failures.push(`${path}: formato de resposta fora do contrato`)
    return response.ok ? body : null
  } catch (error) {
    failures.push(`${path}: ${error.message}`)
    console.log(`ERRO ${path} · ${error.message}`)
    return null
  }
}

await get('/actuator/health', (body) => typeof body?.status === 'string')
const esteiras = await get('/api/esteiras', (body) => Array.isArray(body) && body.every((item) => item.id != null && typeof item.numeroSerial === 'string'))

if (esteiras?.length) {
  const serial = esteiras[0].numeroSerial
  const path = `/api/esteiras/${encodeURIComponent(serial)}`
  await get(path, (body) => body?.id != null && body.numeroSerial === serial)
  await get(`${path}/sensores`, (body) => Array.isArray(body) && body.every((sensor) => sensor.id != null && typeof sensor.porta === 'number' && typeof sensor.tipoSensor === 'string'))
  await get(`${path}/leituras?${new URLSearchParams({ pagina: '0', tamanho: '100' })}`, (body) =>
    Array.isArray(body?.content) && body.content.length <= 100 && Number.isInteger(body.page) && Number.isInteger(body.size) && Number.isInteger(body.totalPages))
} else if (esteiras) {
  console.log('Sem esteiras cadastradas; as rotas dependentes de serial foram ignoradas.')
}

if (failures.length) {
  console.error('\nFalhas:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exitCode = 1
} else {
  console.log('\nRotas verificadas sem erros.')
}
