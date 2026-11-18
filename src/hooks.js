import { useEffect, useState } from 'react'
import { listarEsteiras, listarLeituras, listarSensores, normalizarLeitura } from './services/api.js'

export function useEsteiras() {
  const [esteiras, setEsteiras] = useState([])
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    listarEsteiras()
      .then((dados) => { if (ativo) { setEsteiras(Array.isArray(dados) ? dados : []); setErro('') } })
      .catch((error) => { if (ativo) setErro(error.message) })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [])

  return { esteiras, setEsteiras, erro, carregando }
}

export function useSensores(numeroSerial) {
  const [sensores, setSensores] = useState([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    if (!numeroSerial) { setSensores([]); setErro(''); return () => { ativo = false } }
    listarSensores(numeroSerial)
      .then((dados) => { if (ativo) { setSensores(Array.isArray(dados) ? dados : []); setErro('') } })
      .catch((error) => { if (ativo) setErro(error.message) })
    return () => { ativo = false }
  }, [numeroSerial])

  return { sensores, erro }
}

export function useLeituras(numeroSerial, filtros = {}, intervaloMs = 10000) {
  const [pagina, setPagina] = useState({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const filtrosJson = JSON.stringify(filtros)

  useEffect(() => {
    let ativo = true
    const carregar = async () => {
      if (!numeroSerial) {
        setPagina({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0 })
        setErro('')
        setCarregando(false)
        return
      }
      try {
        const resultado = await listarLeituras(numeroSerial, JSON.parse(filtrosJson))
        if (ativo) {
          setPagina({ ...resultado, content: (resultado.content ?? []).map(normalizarLeitura) })
          setErro('')
        }
      } catch (error) {
        if (ativo) setErro(error.message)
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    setCarregando(true)
    carregar()
    const id = intervaloMs > 0 ? setInterval(carregar, intervaloMs) : null
    return () => { ativo = false; if (id) clearInterval(id) }
  }, [numeroSerial, filtrosJson, intervaloMs])

  return { ...pagina, leituras: pagina.content, erro, carregando }
}
