import { useEffect, useState } from 'react'
import { listarLeituras, normalizar } from './services/api.js'

export function useLeituras(intervaloMs = 5000) {
  const [leituras, setLeituras] = useState([])
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    async function carregar() {
      try {
        const dados = await listarLeituras()
        if (!ativo) return
        setLeituras(dados.map(normalizar).sort((a, b) => b.horario - a.horario))
        setErro('')
      } catch {
        if (ativo) setErro('Não foi possível carregar os dados da API.')
      }
      if (ativo) setCarregando(false)
    }
    carregar()
    const id = setInterval(carregar, intervaloMs)
    return () => { ativo = false; clearInterval(id) }
  }, [intervaloMs])

  return { leituras, erro, carregando }
}
