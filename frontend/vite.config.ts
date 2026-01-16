import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Allow external access
    allowedHosts: [
      '5b1acc63aa6d.ngrok-free.app',
      '.ngrok-free.app', // Allow any ngrok subdomain
      '.ngrok.io', // Support legacy ngrok domains
    ]
  }
})
