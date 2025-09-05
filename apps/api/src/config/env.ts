import { z } from 'zod'

const NodeEnv = z.enum(['development', 'test', 'production'])
const LogLevel = z.enum(['debug', 'info', 'warn', 'error'])

const envSchema = z.object({
  NODE_ENV: NodeEnv.default('development'),
  PORT: z.coerce.number().default(3333),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter pelo menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET deve ter pelo menos 16 caracteres'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().optional(),
  LOG_LEVEL: LogLevel.default('info'),
})

export type Env = z.infer<typeof envSchema>

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('Variáveis de ambiente inválidas! Verifique suas configurações.', z.treeifyError(parsed.error))
    throw new Error('Variáveis de ambiente inválidas!')
  }
  return parsed.data
}
