import jwt from 'jsonwebtoken'
import { loadEnv } from '../config/env'

const env = loadEnv()

export type JwtUser = { id: string; email: string; role: 'user' | 'partner' | 'admin' }
export type JwtUserPayload = JwtUser & jwt.JwtPayload

function toJwtUser(u: Partial<JwtUserPayload>): JwtUser {
  return { id: String(u.id), email: String(u.email), role: String(u.role) as 'user' | 'partner' | 'admin' }
}

export function signAccessToken(user: JwtUser | JwtUserPayload): string {
  const { id, email, role } = toJwtUser(user)
  return jwt.sign(
    { id, email, role },
    env.JWT_SECRET as jwt.Secret,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions,
  )
}

export function signRefreshToken(user: JwtUser | JwtUserPayload): string {
  const { id, email, role } = toJwtUser(user)
  return jwt.sign(
    { id, email, role },
    env.JWT_REFRESH_SECRET as jwt.Secret,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions,
  )
}

export function verifyAccess(token: string): JwtUserPayload {
  return jwt.verify(token, env.JWT_SECRET as jwt.Secret) as JwtUserPayload
}

export function verifyRefresh(token: string): JwtUserPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET as jwt.Secret) as JwtUserPayload
}
