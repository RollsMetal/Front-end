// Barra do reservatório com marcação do limite de alerta
export default function BarraNivel({ nivel, limite }) {
  const acima = nivel > limite;
  return (
    <div>
      <div className="barra">
        <div
          className="preenchimento"
          style={{ width: `${nivel}%`, background: acima ? "var(--mt-alerta)" : "var(--mt-metal)" }}
        ></div>
        <div className="marca" style={{ left: `${limite}%` }}></div>
      </div>
      <div className="d-flex justify-content-between texto-fraco small mt-2">
        <span>0%</span>
        <span>Limite de alerta {limite}%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
