import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' faz o site funcionar em qualquer nome de repositório no GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: './',
})
