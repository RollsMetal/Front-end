export default function Kpi({ rotulo, valor, classe = "", alerta = false }) {
  return (
    <div className={`card h-100 ${alerta ? "card-alerta" : ""}`}>
      <div className="card-body">
        <div className="texto-fraco small">{rotulo}</div>
        <div className={`numero-grande mt-1 ${classe}`}>{valor}</div>
      </div>
    </div>
  );
}
