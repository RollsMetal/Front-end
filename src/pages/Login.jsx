import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { entrar } from '../services/api.js'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  async function enviar(e) {
    e.preventDefault()
    try {
      const { token } = await entrar(email, senha)
      sessionStorage.setItem('token', token)
      navigate('/')
    } catch {
      setErro('Não foi possível entrar. Confira os dados e tente de novo.')
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 p-3">
      <form onSubmit={enviar} className="card shadow-sm p-4 w-100" style={{ maxWidth: 420 }}>
        <div className="fw-bold fs-4 mb-3">
          RollsMetal <span style={{ color: '#c2410c', fontWeight: 500 }}>Monitoramento</span>
        </div>
        <h1 className="fs-5 mb-3">Entrar na plataforma</h1>
        <label htmlFor="email" className="form-label">E-mail ou usuário</label>
        <input id="email" className="form-control form-control-lg mb-3" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="senha" className="form-label">Senha</label>
        <input id="senha" type="password" className="form-control form-control-lg mb-3" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        {erro && <div className="alert alert-danger py-2">{erro}</div>}
        <button className="btn btn-dark btn-lg mb-3">Entrar</button>
        <a href="#/login" className="text-center mb-3">Esqueceu a senha?</a>
        <hr />
        <button type="button" className="btn btn-outline-danger btn-lg" style={{ color: '#c2410c', borderColor: '#c2410c' }}>Criar nova conta</button>
      </form>
    </div>
  )
}
