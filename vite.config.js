import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import process from 'process'


export default defineConfig({
  base: '/',
  host: process.env.VITE_HOST,
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
    host: '0.0.0.0',
    allowedHosts: [
      process.env.VITE_HOST
    ]
  }
})
