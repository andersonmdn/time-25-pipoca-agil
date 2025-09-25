import cors from 'cors'
import dotenv from 'dotenv'
import express, { Express } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import { loadEnv } from './config/env'
import { logger } from './logger'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import { setupSwagger } from './swagger'

export function createApp(): Express {
  // Configurações iniciais (ENV)
  dotenv.config()
  const env = loadEnv()
  const app = express()

  app.disable('x-powered-by') // Segurança básica (oculta o uso do Express)
  app.set('trust proxy', 1) // Necessário se estiver atrás de um proxy (ex: Heroku, Vercel, etc.)

  app.use(
    helmet({
      crossOriginResourcePolicy: false, // Ajuste para evitar bloqueio de imagens em alguns casos (CORS)
    }), // Segurança básica (varias proteções HTTP headers)
  )

  // CORS (ajustado)
  const ALLOWLIST = (env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  console.log('CORS allowlist:', ALLOWLIST)

  // Se ALLOWLIST estiver vazio, permite todas as origens (útil para desenvolvimento local)
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true)
        if (ALLOWLIST.length === 0 || ALLOWLIST.includes(origin)) return cb(null, true)
        return cb(new Error(`CORS não permitido: ${origin}`), false)
      },
      credentials: true,
    }),
  )

  app.use(express.json({ limit: '256kb' })) // Body parser (JSON)
  app.use(morgan('tiny')) // Logs HTTP (simples)

  // Força HTTPS em produção (ajustado)
  if (env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      const proto = req.get('x-forwarded-proto')
      if (proto && proto !== 'https') {
        return res.status(403).json({ message: 'HTTPS necessário' })
      }
      next()
    })
  }

  // Rate limits (mantidos)
  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })

  //app.use(['/login', '/refresh', '/register'], authLimiter)

  // Rotas
  app.use(authRoutes)
  app.use(userRoutes)

  // Swagger (ajustado)
  setupSwagger(app)

  // Erros finais
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: any, res: any, _next: any) => {
    logger.error(err, 'Erro não tratado')
    res.status(500).json({ message: 'Erro interno' })
  })

  return app
}
