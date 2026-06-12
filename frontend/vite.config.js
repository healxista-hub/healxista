// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from "path"

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { fileURLToPath } from 'url';
import basicSsl from '@vitejs/plugin-basic-ssl'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), basicSsl()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    chunkSizeWarningLimit: 1500,
  },

  server: {
    host: true, // VERY IMPORTANT
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5050',
      '/uploads': 'http://localhost:5050',
      '/socket.io': {
        target: 'http://localhost:5050',
        ws: true
      }
    },
    allowedHosts: [
      'localhost',
      '.up.railway.app', // allow all railway subdomains
      '.trycloudflare.com' // allow cloudflare tunnels
    ]
  },

  preview: {
    host: true, // VERY IMPORTANT
    port: 4173,
    allowedHosts: [
      'localhost',
      '.up.railway.app',
      '.trycloudflare.com'
    ]
  }
})
