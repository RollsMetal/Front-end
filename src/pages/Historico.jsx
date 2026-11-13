import { useState } from "react";
import { useLeituras } from "../useLeituras";
import { formatarHora } from "../utils";
import Cabecalho from "../components/Cabecalho";

export default function Historico() {
  const { leituras, offline } = useLeituras();
  const [tipo, setTipo] = useState("TODAS");
  const [sensor, setSensor] = useState("TODOS");

  const filtradas = leituras
    .filter((l) => tipo === "TODAS" || l.tipo === tipo)
    .filter((l) => sensor === "TODOS" || l.sensor === sensor)
    .slice(-30)
    .reverse();

  return (
    <>
      <Cabecalho titulo="Histórico" subtitulo="Últimas leituras da esteira" offline={offline} />

      <div className="card mb-3">
        <div className="card-body row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label texto-fraco small" htmlFor="tipo">Tipo de peça</label>
            <select id="tipo" className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="TODAS">Todas</option>
              <option value="METALICA">Metálica</option>
              <option value="NAO_METALICA">Não metálica</option>
            </select>
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label texto-fraco small" htmlFor="sensor">Sensor</label>
            <select id="sensor" className="form-select" value={sensor} onChange={(e) => setSensor(e.target.value)}>
              <option value="TODOS">Todos</option>
              <option value="INDUTIVO">Indutivo</option>
              <option value="CAPACITIVO">Capacitivo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Horário</th>
                <th>Peça</th>
                <th>Tipo</th>
                <th>Sensor</th>
                <th>Nível (IO-Link)</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((l) => (
                <tr key={l.id}>
                  <td>{formatarHora(l.horario)}</td>
                  <td>#{l.id}</td>
                  <td className={l.tipo === "METALICA" ? "cor-metal" : "cor-nao"}>
                    {l.tipo === "METALICA" ? "Metálica" : "Não metálica"}
                  </td>
                  <td>{l.sensor === "INDUTIVO" ? "Indutivo" : "Capacitivo"}</td>
                  <td>{Math.round(l.nivel)}%</td>
                </tr>
              ))}
              {filtradas.length === 0 && (
                <tr>
                  <td colSpan="5" className="texto-fraco">Nenhuma leitura encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
