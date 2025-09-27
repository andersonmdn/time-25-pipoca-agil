// apps\api\src\app.ts
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import Fastify from 'fastify'
import { ZodTypeProvider, jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { loadEnv } from './config/env'

// Rotas
import { ZodError } from 'zod'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'

const pathToString = (path: (string | number)[]) => (path.length ? path.join('.') : '(root)')

function formatZod(err: ZodError) {
  const details = err.issues.map((i) => ({
    path: pathToString(i.path as (string | number)[]),
    message: i.message,
    code: i.code,
  }))
  const pretty = details.map((d) => `${d.path}: ${d.message}`).join('\n')
  return { pretty, details }
}

export async function createApp() {
  const env = loadEnv()

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
    //logger: true,
    //loggerInstance: pinoLogger,
    trustProxy: true,
  }).withTypeProvider<ZodTypeProvider>()

  // Zod compilers
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.setErrorHandler((err, _req, reply) => {
    // 1) Erros de validação vindos do Zod (Fastify envolve em FST_ERR_VALIDATION e salva em cause)
    const zodErr =
      (err as any)?.cause instanceof ZodError ? ((err as any).cause as ZodError) : err instanceof ZodError ? (err as ZodError) : undefined

    if (zodErr) {
      app.log.error({ err: zodErr }, 'Erro de validação Zod')
      const { pretty, details } = formatZod(zodErr)
      return reply.code(400).send({
        error: pretty, // ex.: "email: Invalid email\npassword: String must contain..."
        details, // array com path/message/code
      })
    }

    // 2) Outros erros de validação do Fastify (sem ZodError por trás)
    if ((err as any).code === 'FST_ERR_VALIDATION' || (err as any).validation) {
      app.log.error({ err }, 'Erro de validação')
      return reply.code(400).send({ error: err.message || 'Parâmetro inválido' })
    }

    // 3) JSON Malformado
    if ((err as any).code === 'FST_ERR_CTP_INVALID_JSON_BODY') {
      app.log.error({ err }, 'JSON malformado')
      return reply.code(500).send({ error: 'JSON malformado' })
    }

    // 4) Demais erros
    app.log.error({ err }, 'Unhandled error')
    return reply.code(500).send({ error: 'Erro interno' })
  })

  // Middlewares equivalentes
  // Aplicar Rete Limit globalmente pode ser um problema para APIs públicas. Aplicar nas rotas que interessam.
  await app.register(fastifyCors, { origin: true })
  await app.register(fastifyHelmet)
  await app.register(rateLimit, { global: false })

  // Swagger a partir do Zod
  await app.register(swagger, {
    openapi: {
      info: { title: 'API do Projeto do Time 25', version: '1.0.0', description: 'Documentação da API' },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
    transform: jsonSchemaTransform,
  })

  await app.register(swaggerUI, { routePrefix: '/api-docs' })

  // Health check
  app.get('/health', async () => ({ ok: true }))

  // Rotas (prefixos iguais aos seus)
  await app.register(authRoutes, { prefix: '/' })
  await app.register(userRoutes, { prefix: '/' })

  // Errors
  app.setErrorHandler((err, _req, reply) => {
    // JSON malformado (Fastify já trata), mas podemos padronizar:
    if ((err as any)?.validation) {
      return reply.code(400).send({ error: 'Parâmetro inválido' })
    }
    app.log.error(err, 'Erro não tratado')
    return reply.code(500).send({ message: 'Erro interno' })
  })

  return app
}
