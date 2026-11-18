import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

// O GitHub Pages publica este projeto no caminho /Front-end/.
// Localmente, a aplicação continua sendo servida na raiz.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = (env.VITE_API_URL || 'http://10.110.12.69:8080').replace(/\/$/, '')
  return {
    plugins: [react()],
    base: process.env.GITHUB_ACTIONS ? '/Front-end/' : '/',
    server: {
      proxy: {
        '/backend': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/backend/, ''),
        },
      },
    },
  }
})
