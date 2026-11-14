import { API_URL } from '../services/api.js'

export default function RealidadeAumentada() {
  const src = `${import.meta.env.BASE_URL}ra/index.html?api=${encodeURIComponent(API_URL)}`
  return (
    <>
      <h1 className="fs-2">Realidade Aumentada</h1>
      <p className="text-secondary">Aponte a câmera para a foto da mesa e veja os sensores identificados.</p>
      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <iframe title="Realidade Aumentada" src={src} allow="camera; microphone" className="w-100 border-0 rounded" style={{ height: 520, background: '#1b2128' }} />
        </div>
        <div className="col-12 col-lg-4">
          <div className="card p-3 h-100">
            <h2 className="fs-5">Sensores na estação</h2>
            <p className="mb-2"><strong>Indutivo</strong><br /><span className="text-secondary">Detecta peças metálicas</span></p>
            <p className="mb-3"><strong>Capacitivo</strong><br /><span className="text-secondary">Detecta peças não metálicas</span></p>
            <a className="btn btn-dark" href={src} target="_blank" rel="noreferrer">Abrir em tela cheia</a>
          </div>
        </div>
      </div>
    </>
  )
}
