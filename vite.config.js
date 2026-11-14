import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O GitHub Pages publica este projeto no caminho /Front-end/.
// Localmente, a aplicação continua sendo servida na raiz.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/Front-end/' : '/',
})
