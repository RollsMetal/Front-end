import { useEffect, useState } from "react";
import { buscarLeituras } from "./api";

// Busca as leituras e atualiza a cada 3 segundos
export function useLeituras() {
  const [estado, setEstado] = useState({ leituras: [], offline: false, carregando: true });

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const resultado = await buscarLeituras();
      if (ativo) {
        setEstado({ leituras: resultado.dados, offline: resultado.offline, carregando: false });
      }
    }

    carregar();
    const intervalo = setInterval(carregar, 3000);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, []);

  return estado;
}
