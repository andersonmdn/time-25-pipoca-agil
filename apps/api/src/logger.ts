import pino from 'pino'
import { loadEnv } from './config/env'

const env = loadEnv()

export const logger = pino({
  level: env.LOG_LEVEL,
  // Remove dados sensíveis automaticamente!
  redact: {
    paths: ['req.headers.authorization', 'headers.authorization', 'password', '*.password'],
    censor: '[REDACTED]',
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    },
  },
})
