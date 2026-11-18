import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../services/api.js'
import { useEsteiras } from '../hooks.js'

export default function RealidadeAumentada() {
  const { esteiras } = useEsteiras()
  const [serial, setSerial] = useState('')
  useEffect(() => { if (!serial && esteiras.length) setSerial(esteiras[0].numeroSerial) }, [esteiras, serial])
  const src = `${import.meta.env.BASE_URL}ra/index.html?api=${encodeURIComponent(API_BASE_URL)}&serial=${encodeURIComponent(serial)}`
  return (
    <>
      <h1 className="fs-2">Realidade Aumentada</h1>
      <p className="text-secondary">Aponte a câmera para a foto da mesa e veja os sensores identificados.</p>
      <div className="mb-3" style={{ maxWidth: 360 }}>
        <label htmlFor="esteira-ra" className="form-label">Esteira</label>
        <select id="esteira-ra" className="form-select" value={serial} onChange={(event) => setSerial(event.target.value)} disabled={!esteiras.length}>
          {!esteiras.length && <option value="">Nenhuma esteira cadastrada</option>}
          {esteiras.map((esteira) => <option key={esteira.id} value={esteira.numeroSerial}>{esteira.numeroSerial}</option>)}
        </select>
      </div>
      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <iframe title="Realidade Aumentada" src={src} allow="camera; microphone" className="w-100 border-0 rounded" style={{ height: 520, background: '#1b2128' }} />
        </div>
        <div className="col-12 col-lg-4">
          <div className="card p-3 h-100">
            <h2 className="fs-5">Sensores na estação</h2>
            <p className="mb-2"><strong>Indutivo</strong><br /><span className="text-secondary">Detecta peças metálicas</span></p>
            <p className="mb-2"><strong>Capacitivo</strong><br /><span className="text-secondary">Detecta peças não metálicas</span></p>
            <p className="mb-3"><strong>Nível (IO-Link)</strong><br /><span className="text-secondary">Mede o nível do reservatório</span></p>
            <a className="btn btn-dark" href={src} target="_blank" rel="noreferrer">Abrir em tela cheia</a>
          </div>
        </div>
      </div>
    </>
  )
}
