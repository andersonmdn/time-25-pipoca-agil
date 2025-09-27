// apps/api/vitest.config.ts (opcional)
import dotenv from 'dotenv'
import config from './vite.config'

dotenv.config({ path: '.env.test' })

export default config
