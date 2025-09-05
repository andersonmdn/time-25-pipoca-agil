import jwt from 'jsonwebtoken'
import { loadEnv } from '../config/env'

const env = loadEnv()

export type JwtUser = { id: string; email: string }

export function signAccessToken(user: JwtUser): string {
  return jwt.sign(
    user,
    env.JWT_SECRET as jwt.Secret,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
  )
}

export function signRefreshToken(user: JwtUser): string {
  return jwt.sign(
    user,
    env.JWT_REFRESH_SECRET as jwt.Secret,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions,
  )
}

export function verifyAccess(token: string): JwtUser {
  return jwt.verify(token, env.JWT_SECRET as jwt.Secret) as JwtUser
}

export function verifyRefresh(token: string): JwtUser {
  return jwt.verify(token, env.JWT_REFRESH_SECRET as jwt.Secret) as JwtUser
}
