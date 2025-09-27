// src/server.ts
import 'dotenv/config'
import { createApp } from './app'
import { loadEnv } from './config/env'

async function main() {
  const env = loadEnv()
  const app = await createApp()
  const addr = await app.listen({ port: env.PORT, host: '0.0.0.0' })
  app.log.info(`API rodando em ${addr} | docs: /api-docs`)
}

main()
