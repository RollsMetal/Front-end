
const DEFAULT_LOCAL_API_URL = 'http://localhost:8080';

const API_URL = import.meta.env.DEV
  ? DEFAULT_LOCAL_API_URL
  : (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const API_BASE_URL = import.meta.env.DEV
  ? '/backend'
  : API_URL;

export class ApiError extends Error {
  constructor(message, { status, body, url } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.url = url;
    this.validationErrors = body?.validationErrors ?? {};
  }
}

async function request(path, options = {}, expectedStatus) {
  if (!API_BASE_URL) {
    throw new ApiError(
      'A URL da API não está configurada. Verifique a variável VITE_API_URL.'
    );
  }

  const url = `${API_BASE_URL}${path}`;

  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new ApiError(
      `Não foi possível conectar à API em ${API_URL || DEFAULT_LOCAL_API_URL}: ${error.message}`,
      { url }
    );
  }

  const raw = await response.text();

  let body;

  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = raw;
  }

  if (
    !response.ok ||
    (expectedStatus !== undefined && response.status !== expectedStatus)
  ) {
    const message = body && typeof body === 'object'
      ? [
          body.message,
          ...Object.values(body.validationErrors ?? {})
        ].filter(Boolean).join(' ')
      : '';

    throw new ApiError(
      message || `A API respondeu com status ${response.status}.`,
      {
        status: response.status,
        body,
        url,
      }
    );
  }

  return body;
}

const serialPath = (numeroSerial) =>
  `/api/esteiras/${encodeURIComponent(numeroSerial)}`;

export function listarEsteiras() {
  return request('/api/esteiras');
}

export function cadastrarEsteira(numeroSerial) {
  if (!numeroSerial?.trim()) {
    return Promise.reject(
      new Error('Informe o número serial da esteira.')
    );
  }

  return request('/api/esteiras', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      numeroSerial: numeroSerial.trim(),
    }),
  });
}

export function buscarEsteira(numeroSerial) {
  return request(serialPath(numeroSerial));
}

export function listarSensores(numeroSerial) {
  return request(`${serialPath(numeroSerial)}/sensores`);
}

const OFFSET_ISO = /(?:Z|[+-]\d{2}:\d{2})$/i;

export function montarQueryLeituras(filtros = {}) {
  const params = new URLSearchParams();

  const pagina = Number(filtros.pagina ?? 0);
  const tamanho = Number(filtros.tamanho ?? 100);

  if (!Number.isInteger(pagina) || pagina < 0) {
    throw new Error(
      'A página deve ser um inteiro maior ou igual a zero.'
    );
  }

  if (
    !Number.isInteger(tamanho) ||
    tamanho < 1 ||
    tamanho > 100
  ) {
    throw new Error(
      'O tamanho da página deve estar entre 1 e 100.'
    );
  }

  params.set('pagina', String(pagina));
  params.set('tamanho', String(tamanho));

  for (const key of ['sensorId', 'porta']) {
    const value = filtros[key];

    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      continue;
    }

    if (!/^\d+$/.test(String(value)) || Number(value) <= 0) {
      throw new Error(
        `${key} deve ser um inteiro positivo.`
      );
    }

    params.set(key, String(value));
  }

  if (filtros.tipoMaterial) {
    const tipos = [
      'METAL',
      'PLASTICO',
      'SEM_MATERIAL',
      'DESCONHECIDO',
    ];

    if (!tipos.includes(filtros.tipoMaterial)) {
      throw new Error('Tipo de material inválido.');
    }

    params.set('tipoMaterial', filtros.tipoMaterial);
  }

  for (const key of ['dataInicio', 'dataFim']) {
    const value = filtros[key];

    if (!value) continue;

    if (
      typeof value !== 'string' ||
      !OFFSET_ISO.test(value) ||
      Number.isNaN(Date.parse(value))
    ) {
      throw new Error(
        `${key} deve ser uma data ISO-8601 com offset ou Z.`
      );
    }

    params.set(key, value);
  }

  if (
    filtros.dataInicio &&
    filtros.dataFim &&
    Date.parse(filtros.dataInicio) >
      Date.parse(filtros.dataFim)
  ) {
    throw new Error(
      'A data inicial deve ser anterior ou igual à data final.'
    );
  }

  return params.toString();
}

export function listarLeituras(numeroSerial, filtros = {}) {
  if (!numeroSerial) {
    return Promise.reject(
      new Error('Selecione uma esteira para consultar as leituras.')
    );
  }

  const query = montarQueryLeituras(filtros);

  return request(
    `${serialPath(numeroSerial)}/leituras?${query}`
  );
}

export function normalizarLeitura(leitura) {
  const tipoMaterial = String(
    leitura.tipoMaterial ?? 'DESCONHECIDO'
  ).toUpperCase();

  return {
    ...leitura,
    horario: new Date(leitura.data),
    tipoMaterial,
    metalica: tipoMaterial === 'METAL',
    hexadecimal: leitura.hexadecimal ?? '',
    sensor: leitura.tipoSensor ?? 'Desconhecido',
  };
}

export function cadastrarUsuario({ nome, email, senha }) {
  if (
    typeof senha !== 'string' ||
    senha.length < 12 ||
    senha.length > 72 ||
    new TextEncoder().encode(senha).length > 72
  ) {
    return Promise.reject(
      new Error(
        'A senha deve ter entre 12 e 72 caracteres e no máximo 72 bytes UTF-8.'
      )
    );
  }

  return request('/api/usuarios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nome: nome.trim(),
      email: email.trim(),
      senha,
    }),
  });
}

export function loginUsuario({ email, senha }) {
  return request('/api/usuarios/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      senha,
    }),
  }, 200);
}
