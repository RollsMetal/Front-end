import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cadastrarUsuario } from '../services/api.js'

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validar(formulario) {
  const erros = {}
  const nome = formulario.nome.trim()
  const email = formulario.email.trim()
  const senha = formulario.senha
  const bytesSenha = new TextEncoder().encode(senha).length

  if (!nome) erros.nome = 'Informe seu nome completo.'
  else if (nome.length > 150) erros.nome = 'O nome deve ter no máximo 150 caracteres.'

  if (!email) erros.email = 'Informe seu e-mail.'
  else if (email.length > 150) erros.email = 'O e-mail deve ter no máximo 150 caracteres.'
  else if (!EMAIL_VALIDO.test(email)) erros.email = 'Informe um e-mail válido.'

  if (!senha) erros.senha = 'Informe uma senha.'
  else if (senha.length < 12) erros.senha = 'A senha deve ter pelo menos 12 caracteres.'
  else if (senha.length > 72 || bytesSenha > 72) erros.senha = 'A senha deve respeitar o limite de 72 caracteres e 72 bytes UTF-8.'

  if (!formulario.confirmacao) erros.confirmacao = 'Confirme sua senha.'
  else if (senha !== formulario.confirmacao) erros.confirmacao = 'As senhas não coincidem.'
  return erros
}

export default function CadastroUsuario() {
  const navigate = useNavigate()
  const [formulario, setFormulario] = useState({ nome: '', email: '', senha: '', confirmacao: '' })
  const [erros, setErros] = useState({})
  const [erroEnvio, setErroEnvio] = useState('')
  const [enviando, setEnviando] = useState(false)

  function atualizar(campo) {
    return (event) => {
      setFormulario((atual) => ({ ...atual, [campo]: event.target.value }))
      setErros((atuais) => ({ ...atuais, [campo]: '' }))
      setErroEnvio('')
    }
  }

  async function enviar(event) {
    event.preventDefault()
    if (enviando) return

    const errosFormulario = validar(formulario)
    setErros(errosFormulario)
    setErroEnvio('')
    if (Object.values(errosFormulario).some(Boolean)) return

    setEnviando(true)
    try {
      await cadastrarUsuario({
        nome: formulario.nome.trim(),
        email: formulario.email.trim(),
        senha: formulario.senha,
      })
      setFormulario((atual) => ({ ...atual, senha: '', confirmacao: '' }))
      navigate('/dashboard', { replace: true })
    } catch (error) {
      if (error.status === 409) {
        setErroEnvio('Este e-mail já está cadastrado. Confira o endereço ou use outro e-mail.')
      } else if (error.status) {
        setErroEnvio(error.message || 'Não foi possível concluir o cadastro. Confira os dados e tente novamente.')
      } else {
        setErroEnvio('Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
      <form className="card shadow-sm p-4 p-md-5 w-100" style={{ maxWidth: 520 }} onSubmit={enviar} noValidate>
        <div className="fw-bold fs-4 mb-3">
          RollsMetal <span style={{ color: '#c2410c', fontWeight: 500 }}>Monitoramento</span>
        </div>
        <h1 className="fs-4 mb-1">Cadastro de usuário</h1>
        <p className="text-secondary mb-4">Crie seu registro para continuar ao monitoramento.</p>

        <Campo id="nome" label="Nome completo" erro={erros.nome}>
          <input id="nome" name="nome" className={`form-control${erros.nome ? ' is-invalid' : ''}`} autoComplete="name" maxLength={150} value={formulario.nome} onChange={atualizar('nome')} disabled={enviando} required aria-invalid={Boolean(erros.nome)} />
        </Campo>
        <Campo id="email" label="E-mail" erro={erros.email}>
          <input id="email" name="email" type="email" className={`form-control${erros.email ? ' is-invalid' : ''}`} autoComplete="email" maxLength={150} value={formulario.email} onChange={atualizar('email')} disabled={enviando} required aria-invalid={Boolean(erros.email)} />
        </Campo>
        <Campo id="senha" label="Senha" erro={erros.senha} ajuda="Use de 12 a 72 caracteres; o limite de 72 bytes UTF-8 também se aplica.">
          <input id="senha" name="senha" type="password" className={`form-control${erros.senha ? ' is-invalid' : ''}`} autoComplete="new-password" value={formulario.senha} onChange={atualizar('senha')} disabled={enviando} required aria-invalid={Boolean(erros.senha)} />
        </Campo>
        <Campo id="confirmacao" label="Confirmar senha" erro={erros.confirmacao}>
          <input id="confirmacao" name="confirmacao" type="password" className={`form-control${erros.confirmacao ? ' is-invalid' : ''}`} autoComplete="new-password" value={formulario.confirmacao} onChange={atualizar('confirmacao')} disabled={enviando} required aria-invalid={Boolean(erros.confirmacao)} />
        </Campo>

        {erroEnvio && <div className="alert alert-danger py-2" role="alert">{erroEnvio}</div>}
        <button type="submit" className="btn btn-rm btn-lg mt-2" disabled={enviando}>
          {enviando ? <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Cadastrando…</> : 'Cadastrar usuário'}
        </button>
      </form>
    </div>
  )
}

function Campo({ id, label, erro, ajuda, children }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      {children}
      {ajuda && <div className="form-text">{ajuda}</div>}
      {erro && <div className="invalid-feedback d-block">{erro}</div>}
    </div>
  )
}
