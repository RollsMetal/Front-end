import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Sensores from "./pages/Sensores";
import Historico from "./pages/Historico";
import Analises from "./pages/Analises";
import Alertas from "./pages/Alertas";
import Configuracoes from "./pages/Configuracoes";
import Perfil from "./pages/Perfil";
import RealidadeAumentada from "./pages/RealidadeAumentada";

export default function App() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sensores" element={<Sensores />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/analises" element={<Analises />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/realidade-aumentada" element={<RealidadeAumentada />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </main>
    </div>
  );
}
