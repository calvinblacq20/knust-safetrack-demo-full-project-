import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Serve landing.html at "/" and the React app at "/app"
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'landing.html'),
        app: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    // When visiting "/", serve landing.html
    // When visiting "/app", serve the React app (index.html)
    open: '/landing.html',
  },
})
