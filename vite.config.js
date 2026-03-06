import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'process'


export default defineConfig({
  base: '/',
  host: process.env.VITE_HOST,
  plugins: [react(), tailwindcss()],
  server: {
    port: process.env.VITE_PORT || 5175,
    allowedHosts: [
      process.env.VITE_HOST
    ]
  }
})
