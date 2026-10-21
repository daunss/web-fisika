import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Muat environment variables dari root workspace
  const env = loadEnv(mode, process.cwd() + '/../', '')
  const backendUrl = env.VITE_API_BASE_URL || 'http://localhost:3000'
  const clientPort = Number(env.VITE_PORT) || 5173

  return {
    plugins: [react()],
    envDir: '../',
    server: {
      port: clientPort,
      host: true,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  }
})

