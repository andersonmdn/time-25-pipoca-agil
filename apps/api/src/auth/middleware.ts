// apps\api\src\auth\middleware.ts
import { FastifyReply, FastifyRequest } from 'fastify'
import { JwtUser, verifyAccess } from '../auth/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtUser
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const auth = request.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Cabeçalho de autorização ausente ou inválido' })
  }
  const token = auth.slice(7)
  try {
    const payload = verifyAccess(token)
    request.user = payload
  } catch {
    return reply.code(401).send({ error: 'Token inválido ou expirado' })
  }
}
