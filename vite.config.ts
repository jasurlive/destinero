import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { GET as tiles } from './api/tiles.ts'

// runs api/tiles.ts on the dev server too (Vercel runs it in production)
const tileProxy = (): Plugin => ({
  name: 'tile-proxy',
  configureServer(server) {
    process.env.MAPKEY ??= loadEnv(server.config.mode, process.cwd(), '').MAPKEY
    server.middlewares.use('/api/tiles', async (req, res) => {
      const response = await tiles(new Request(`http://localhost${req.originalUrl}`))
      res.statusCode = response.status
      response.headers.forEach((value, name) => res.setHeader(name, value))
      res.end(Buffer.from(await response.arrayBuffer()))
    })
  },
})

export default defineConfig({
  server: {
    port: 2020,
    open: true,
  },
  plugins: [
    tileProxy(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
