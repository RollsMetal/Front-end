import { useState } from "react";
import { API_URL } from "../api";
import Cabecalho from "../components/Cabecalho";

const sensores = [
  { nome: "Sensor capacitivo", funcao: "Detecta peças não metálicas (plástico, madeira etc.)", cor: "var(--mt-nao)" },
  { nome: "Sensor indutivo", funcao: "Detecta peças metálicas", cor: "var(--mt-metal)" },
  { nome: "Sensor IO-Link", funcao: "Mede a distância e o nível do reservatório", cor: "var(--mt-alerta)" },
];

// A parte de RA fica em public/ra/index.html (A-Frame + MindAR)
const enderecoRA = `/ra/index.html?api=${encodeURIComponent(API_URL)}`;

export default function RealidadeAumentada() {
  const [ligado, setLigado] = useState(false);

  return (
    <>
      <Cabecalho titulo="Realidade Aumentada" subtitulo="Aponte a câmera para a mesa e veja os sensores" />

      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <div className="card">
            <div className="card-body">
              {ligado ? (
                <iframe
                  title="Realidade aumentada"
                  src={enderecoRA}
                  allow="camera; fullscreen"
                  style={{ width: "100%", height: "70vh", minHeight: 480, border: 0, borderRadius: 12 }}
                />
              ) : (
                <div className="text-center py-5">
                  <p className="texto-fraco">A câmera só liga quando você clicar no botão.</p>
                  <button className="btn btn-metal" onClick={() => setLigado(true)}>
                    Iniciar câmera
                  </button>
                </div>
              )}
              <div className="d-flex gap-2 flex-wrap mt-3">
                {ligado && (
                  <button className="btn btn-outline-secondary" onClick={() => setLigado(false)}>
                    Parar câmera
                  </button>
                )}
                <a className="btn btn-outline-secondary d-flex align-items-center" href={enderecoRA} target="_blank" rel="noreferrer">
                  Abrir em tela cheia
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card mb-3">
            <div className="card-body">
              <h2 className="h6 mb-3">O que aparece na câmera</h2>
              {sensores.map((s) => (
                <div key={s.nome} className="mb-3">
                  <div style={{ color: s.cor }} className="fw-bold">● {s.nome}</div>
                  <div className="texto-fraco small">{s.funcao}</div>
                </div>
              ))}
              <div className="texto-fraco small">Cada sensor aparece com uma linha ligada ao cartão, mostrando o valor vindo da API.</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h2 className="h6 mb-3">Imagem para escanear</h2>
              <img
                src="/ra/alvo.jpg"
                alt="Foto da mesa usada como alvo da RA"
                className="img-fluid rounded"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="texto-fraco small mt-2">Se a foto estiver em public/ra/alvo.jpg, ela aparece aqui para você apontar a câmera.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
