import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { loginUsuario } from '../services/api.js'
import { iniciarSessaoUsuario, possuiSessaoConfirmada } from '../services/session.js'

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validar(formulario) {
  const erros = {}
  const email = formulario.email.trim()

  if (!email) erros.email = 'Informe seu e-mail.'
  else if (!EMAIL_VALIDO.test(email)) erros.email = 'Informe um e-mail válido.'

  if (!formulario.senha) erros.senha = 'Informe sua senha.'
  return erros
}

export default function Login() {
  const navigate = useNavigate()
  const envioEmAndamento = useRef(false)
  const [formulario, setFormulario] = useState({ email: '', senha: '' })
  const [erros, setErros] = useState({})
  const [erroEnvio, setErroEnvio] = useState('')
  const [carregando, setCarregando] = useState(false)

  if (possuiSessaoConfirmada()) return <Navigate to="/" replace />

  function atualizar(campo) {
    return (event) => {
      setFormulario((atual) => ({ ...atual, [campo]: event.target.value }))
      setErros((atuais) => ({ ...atuais, [campo]: '' }))
      setErroEnvio('')
    }
  }

  async function enviar(event) {
    event.preventDefault()
    if (envioEmAndamento.current) return

    const errosFormulario = validar(formulario)
    setErros(errosFormulario)
    setErroEnvio('')
    if (Object.values(errosFormulario).some(Boolean)) return

    envioEmAndamento.current = true
    setCarregando(true)
    try {
      let usuario
      try {
        usuario = await loginUsuario({ email: formulario.email.trim(), senha: formulario.senha })
      } catch (error) {
        if (error.status === 401) {
          setErroEnvio('E-mail ou senha inválidos.')
        } else if (error.status) {
          setErroEnvio(error.message || 'Não foi possível validar as credenciais. Tente novamente.')
        } else {
          setErroEnvio('Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.')
        }
        return
      }

      try {
        iniciarSessaoUsuario(usuario)
      } catch {
        setErroEnvio('As credenciais foram confirmadas, mas não foi possível salvar a sessão nesta aba.')
        return
      }

      setFormulario((atual) => ({ ...atual, senha: '' }))
      navigate('/', { replace: true })
    } finally {
      envioEmAndamento.current = false
      setCarregando(false)
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
      <form className="card shadow-sm p-4 p-md-5 w-100" style={{ maxWidth: 480 }} onSubmit={enviar} noValidate>
        <div className="fw-bold fs-4 mb-3">
          RollsMetal <span style={{ color: '#c2410c', fontWeight: 500 }}>Monitoramento</span>
        </div>
        <h1 className="fs-4 mb-1">Entrar</h1>
        <p className="text-secondary mb-4">Informe suas credenciais para acessar o monitoramento.</p>

        <Campo id="email" label="E-mail" erro={erros.email}>
          <input id="email" name="email" type="email" className={`form-control${erros.email ? ' is-invalid' : ''}`} autoComplete="email" maxLength={150} value={formulario.email} onChange={atualizar('email')} disabled={carregando} required aria-invalid={Boolean(erros.email)} />
        </Campo>
        <Campo id="senha" label="Senha" erro={erros.senha}>
          <input id="senha" name="senha" type="password" className={`form-control${erros.senha ? ' is-invalid' : ''}`} autoComplete="current-password" value={formulario.senha} onChange={atualizar('senha')} disabled={carregando} required aria-invalid={Boolean(erros.senha)} />
        </Campo>

        {erroEnvio && <div className="alert alert-danger py-2" role="alert">{erroEnvio}</div>}
        <button type="submit" className="btn btn-rm btn-lg mt-2" disabled={carregando}>
          {carregando ? <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Entrando…</> : 'Entrar'}
        </button>
        <p className="text-secondary text-center small mt-3 mb-0">
          Ainda não tem cadastro? <Link to="/cadastro">Cadastrar usuário</Link>
        </p>
      </form>
    </div>
  )
}

function Campo({ id, label, erro, children }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      {children}
      {erro && <div className="invalid-feedback d-block">{erro}</div>}
    </div>
  )
}
