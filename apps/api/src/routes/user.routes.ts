// src/routes/user.routes.ts
import {
  schemaUserListBody,
  schemaUserListResponse,
  schemaUserSelectResponsePublic,
  schemaUserUpdateBody,
  schemaUserUpdateParams,
  UserListBody,
  UserUpdateBody,
  UserUpdateParams,
} from '@chargemap/validations'
import { Prisma } from '@prisma/client'
import { FastifyPluginAsync } from 'fastify'
import z from 'zod'
import { requireAuth } from '../auth/middleware'
import { getUsersPaginated, updateUser } from '../services/user.service'

const errorSchema = z.object({ error: z.string() })

const userRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/users',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Users'],
        summary: 'Listar usuários',
        description: 'Retorna lista paginada de usuários (JWT Bearer).',
        security: [{ bearerAuth: [] }],
        querystring: schemaUserListBody,
        response: {
          200: schemaUserListResponse,
          400: errorSchema,
          401: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { page, limit, sort, order } = request.query as UserListBody
      const { users, total } = await getUsersPaginated({ page, limit, sort, order })
      const data = users.map((u) => schemaUserSelectResponsePublic.parse(u))
      const pages = Math.ceil(total / limit) || 1
      const hasNext = page < pages
      const hasPrev = page > 1
      return reply.send({ data, meta: { total, page, limit, pages, hasNext, hasPrev, sort, order } })
    },
  )

  app.put(
    '/users/:id',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Users'],
        summary: 'Atualizar usuário',
        description: 'Atualiza dados do usuário (JWT Bearer).',
        security: [{ bearerAuth: [] }],
        params: schemaUserUpdateParams,
        body: schemaUserUpdateBody,
        response: {
          200: schemaUserSelectResponsePublic,
          400: errorSchema,
          401: errorSchema,
          403: errorSchema,
          404: errorSchema,
          409: errorSchema,
          500: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as UserUpdateParams
      const { email, password, name, phone } = request.body as UserUpdateBody

      const requester = request.user
      const requesterId = Number(requester?.id)
      const isAdmin = requester?.role === 'admin'
      if (requesterId !== id && !isAdmin) {
        return reply.code(403).send({ error: 'Acesso negado' })
      }

      try {
        const user = await updateUser(id, { email, password, name, phone })
        if (!user) return reply.code(404).send({ error: 'Usuário não encontrado' })

        const userResponse = schemaUserSelectResponsePublic.parse(user)
        return reply.send(userResponse)
      } catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
          return reply.code(404).send({ error: 'Usuário não encontrado' })
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          return reply.code(409).send({ error: 'Email já registrado' })
        }

        return reply.code(500).send({ error: 'Erro ao registrar' })
      }
    },
  )
}

export default userRoutes
