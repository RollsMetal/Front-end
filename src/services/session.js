const SESSION_KEY = 'rollsmetal-session'
const SESSION_VALUE = 'backend-confirmed'
const USER_KEY = 'rollsmetal-user'

export function possuiSessaoConfirmada() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === SESSION_VALUE
  } catch {
    return false
  }
}

export function iniciarSessaoUsuario(usuario) {
  if (usuario && typeof usuario === 'object' && !Array.isArray(usuario)) {
    const usuarioPublico = {}
    if (typeof usuario.id === 'number' || typeof usuario.id === 'string') usuarioPublico.id = usuario.id
    if (typeof usuario.nome === 'string') usuarioPublico.nome = usuario.nome
    if (typeof usuario.email === 'string') usuarioPublico.email = usuario.email
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(usuarioPublico))
  } else {
    window.sessionStorage.removeItem(USER_KEY)
  }

  window.sessionStorage.setItem(SESSION_KEY, SESSION_VALUE)
}

export function encerrarSessao() {
  window.sessionStorage.removeItem(SESSION_KEY)
  window.sessionStorage.removeItem(USER_KEY)
}
