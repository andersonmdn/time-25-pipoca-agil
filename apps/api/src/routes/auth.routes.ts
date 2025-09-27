// src/routes/auth.routes.ts
import {
  Login,
  Refresh,
  schemaLoginBody,
  schemaLoginResponse,
  schemaRefreshBody,
  schemaUserCreateBody,
  schemaUserCreateResponse,
  UserCreateBody,
} from '@chargemap/validations'
import { Prisma } from '@prisma/client'
import { FastifyPluginAsync } from 'fastify'
import z from 'zod'
import { signAccessToken, signRefreshToken, verifyRefresh } from '../auth/jwt'
import { createUser, findUserByEmail, verifyPassword } from '../services/user.service'

const errorSchema = z.object({ error: z.string() })

const refreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

const authRoutes: FastifyPluginAsync = async (app) => {
  // Rate limit específico da rota (opcional)
  // app.register(rateLimit, { max: 120, timeWindow: '1 minute' })

  app.post(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Registrar novo usuário',
        description: 'Cria um novo usuário e retorna tokens de autenticação.',
        body: schemaUserCreateBody,
        response: {
          201: schemaUserCreateResponse,
          400: errorSchema,
          409: errorSchema,
          500: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password, name, phone } = request.body as UserCreateBody
      try {
        const user = await createUser({ email, password, name, phone })
        const payload = { id: String(user.id), email: user.email, role: 'user' as const }
        return reply.code(201).send({
          user: { id: user.id, email: user.email, name: user.name },
          accessToken: signAccessToken(payload),
          refreshToken: signRefreshToken(payload),
        })
      } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          return reply.code(409).send({ error: 'Email já registrado' })
        }
        return reply.code(500).send({ error: 'Erro ao registrar' })
      }
    },
  )

  app.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Login com email e senha',
        description: 'Valida credenciais e retorna par de tokens JWT.',
        body: schemaLoginBody,
        response: {
          200: schemaLoginResponse,
          400: errorSchema, // erro de validação
          401: errorSchema, // credenciais inválidas
          500: errorSchema, // erro interno
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as Login

      const user = await findUserByEmail(email)
      if (!user) return reply.code(401).send({ error: 'Credenciais inválidas' })

      const ok = await verifyPassword(user.password, password)
      if (!ok) return reply.code(401).send({ error: 'Credenciais inválidas' })

      const payload = { id: String(user.id), email: user.email, role: (user.role ?? 'user') as 'user' | 'admin' }
      return reply.send({
        user: { id: user.id, email: user.email, name: user.name },
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
      })
    },
  )

  app.post(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Renovar tokens',
        description: 'Recebe um refresh token válido e retorna um novo par (accessToken, refreshToken). Não requer Bearer no header.',
        body: schemaRefreshBody,
        response: {
          200: refreshResponseSchema,
          400: errorSchema, // validação/ausência
          401: errorSchema, // refresh inválido/expirado
          500: errorSchema, // erro interno
        },
      },
    },
    async (request, reply) => {
      const { refreshToken } = request.body as Refresh
      try {
        // 1) validar/verificar refresh token e extrair payload mínimo
        const payload = verifyRefresh(refreshToken)

        // 2) opcional: checar se token está revogado em storage/blacklist/versão do token
        // if (await isRevoked(refreshToken)) return reply.code(401).send({ error: 'Refresh token inválido' })

        // 3) gerar novo par de tokens (rotacionar refresh é uma boa prática)
        const newAccess = signAccessToken({ id: payload.id, email: payload.email, role: payload.role })
        const newRefresh = signRefreshToken({ id: payload.id, email: payload.email, role: payload.role })

        return reply.send({ accessToken: newAccess, refreshToken: newRefresh })
      } catch {
        return reply.code(401).send({ error: 'Refresh token inválido ou expirado' })
      }
    },
  )

  app.post(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Logout',
        description: 'Efetua logout do usuário. (Stub: não implementa blacklist de tokens (Ainda))',
        response: {
          200: z.object({ ok: z.boolean() }),
        },
      },
    },
    async (_request, reply) => {
      // Stub: não faz nada, apenas responde 200 OK
      return reply.send({ ok: true })
    },
  )
}

export default authRoutes
