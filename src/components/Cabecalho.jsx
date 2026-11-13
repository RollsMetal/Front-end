export default function Cabecalho({ titulo, subtitulo, offline }) {
  return (
    <header className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
      <div>
        <h1 className="h3 mb-1">{titulo}</h1>
        <div className="texto-fraco small">{subtitulo}</div>
      </div>
      {offline && <span className="badge text-bg-warning">API offline: sem dados</span>}
    </header>
  );
}
