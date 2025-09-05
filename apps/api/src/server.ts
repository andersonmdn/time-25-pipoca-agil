import dotenv from 'dotenv'
import 'dotenv/config'
import { createApp } from './app'
import { loadEnv } from './config/env'
import { logger } from './logger'

dotenv.config()
const env = loadEnv()
const app = createApp()
const PORT = env.PORT

app.listen(PORT, () => {
  logger.info({ port: PORT }, `API rodando em http://localhost:${PORT}`)
})
