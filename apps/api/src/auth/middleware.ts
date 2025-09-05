import { NextFunction, Request, Response } from 'express'
import { JwtUser, verifyAccess } from './jwt'

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Cabeçalho de autorização ausente ou inválido' })
  }
  const token = auth.slice(7)
  try {
    const payload = verifyAccess(token)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}
