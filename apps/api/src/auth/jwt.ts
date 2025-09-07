import jwt from 'jsonwebtoken'
import { loadEnv } from '../config/env'

const env = loadEnv()

export type JwtUser = { id: string; email: string }
export type JwtUserPayload = JwtUser & jwt.JwtPayload

function toJwtUser(u: Partial<JwtUserPayload>): JwtUser {
  return { id: String(u.id), email: String(u.email) }
}

export function signAccessToken(user: JwtUser | JwtUserPayload): string {
  const { id, email } = toJwtUser(user)
  return jwt.sign(
    { id, email },
    env.JWT_SECRET as jwt.Secret,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions,
  )
}

export function signRefreshToken(user: JwtUser | JwtUserPayload): string {
  const { id, email } = toJwtUser(user)
  return jwt.sign(
    { id, email },
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
