import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  worker: { format: 'es' },
  // GitHub Pages serves a project site from a subpath (/PyLearn/), so the asset
  // base is configurable at build time. Local dev and the Node server use '/'.
  base: process.env.VITE_BASE || '/',
  server: {
    port: 5183,
    strictPort: true,
    // The API runs in its own process (`npm run server`) because it needs a
    // database. Proxying keeps the browser on one origin, so the session
    // cookie is same-origin and no CORS handling is needed.
    proxy: {
      '/api': { target: 'http://localhost:5184' },
    },
  },
})
