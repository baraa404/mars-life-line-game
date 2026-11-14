import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { pebbleMiddleware } from './server/pebble/chat.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['GEMINI_', 'PEBBLE_'])
  return {
    base: process.env.GITHUB_PAGES === 'true' ? '/mars-life-line-game/' : '/',
    plugins: [react(), {
      name: 'pebble-chat',
      configureServer(server) { server.middlewares.use(pebbleMiddleware(env)) },
      configurePreviewServer(server) { server.middlewares.use(pebbleMiddleware(env)) },
    }],
  }
})
