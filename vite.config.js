import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_LOCAL_URL = 'http://localhost:8080'

// O GitHub Pages publica este projeto no caminho /Front-end/.
// Localmente, a aplicação continua sendo servida na raiz.
export default defineConfig(() => ({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/Front-end/' : '/',
  server: {
    proxy: {
      '/backend': {
        target: API_LOCAL_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, ''),
      },
    },
  },
}))
