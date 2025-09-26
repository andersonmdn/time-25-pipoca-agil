import request from 'supertest'
import { expect } from 'vitest'

export const API_URL = process.env.API_URL

export function checkApiUrl() {
  if (!API_URL) {
    throw new Error('Defina API_URL para rodar testes de integração reais.')
  }
}

export function newEmail(prefix = 'vitest'): string {
  return `${prefix}+${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`
}

export function dumpOnFail(res: any, expected: number | number[]) {
  const expectedArr = Array.isArray(expected) ? expected : [expected]
  if (!expectedArr.includes(res.status)) {
    // eslint-disable-next-line no-console
    console.error('== RESPONSE DUMP ==')
    // eslint-disable-next-line no-console
    console.error('Status:', res.status)
    // eslint-disable-next-line no-console
    console.error('Headers:', res.headers)
    // eslint-disable-next-line no-console
    console.error('Body:', JSON.stringify(res.body ?? res.text, null, 2))
  }
}

export async function getAccessToken(): Promise<string> {
  if (!API_URL) throw new Error('API_URL indefinido.')

  if (!process.env.ACCESS_TOKEN) {
    if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
      throw new Error('Defina TEST_USER_EMAIL e TEST_USER_PASSWORD ou ACCESS_TOKEN para obter token de acesso.')
    }
  }

  return process.env.ACCESS_TOKEN || ''
}

export async function getTestUserId(): Promise<number> {
  if (!API_URL) throw new Error('API_URL indefinido.')

  if (!process.env.TEST_USER_ID) {
    throw new Error('Defina TEST_USER_ID para obter ID do usuário de teste.')
  }

  return Number(process.env.TEST_USER_ID)
}

export async function getAdminAccessToken(): Promise<string> {
  if (!API_URL) throw new Error('API_URL indefinido.')
  if (!process.env.ADMIN_USER_EMAIL || !process.env.ADMIN_USER_PASSWORD) {
    throw new Error('Defina ADMIN_USER_EMAIL e ADMIN_USER_PASSWORD para obter token de Admin.')
  }

  if (!process.env.ADMIN_ACCESS_TOKEN) {
    throw new Error('Defina ADMIN_ACCESS_TOKEN para obter token de Admin.')
  }

  if (!process.env.ADMIN_REFRESH_TOKEN) {
    throw new Error('Defina ADMIN_REFRESH_TOKEN para obter token de Admin.')
  }

  return process.env.ADMIN_ACCESS_TOKEN || ''
}

/**
 * Cria usuário e retorna { id, accessToken, email }.
 */
export async function createUserAndLogin(): Promise<{ id: number; accessToken: string; email: string }> {
  if (!API_URL) throw new Error('API_URL indefinido.')
  const email = newEmail('self')
  const password = 'SenhaF0rte@1'

  const reg = await request(API_URL).post('/register').send({
    email,
    password,
    name: 'Self User',
    phone: '+55 11999990000',
  })
  expect(reg.status).toBe(201)
  expect(reg).toHaveProperty('body')
  expect(reg.body).toHaveProperty('user')
  expect(reg.body.user).toHaveProperty('id')
  expect(reg.body.user.id).toBeGreaterThanOrEqual(1)
  const id: number = reg.body.user?.id
  const accessToken: string = reg.body?.accessToken

  if (!accessToken) throw new Error('Não foi possível obter accessToken após registro.')
  return { id, accessToken, email }
}

/**
 * Gera um token adulterado (altera 1 char) para forçar falha de verificação.
 */
export function tamper(token: string): string {
  if (token.length < 2) return token + 'x'
  const flip = token[token.length - 1] === 'a' ? 'b' : 'a'
  return token.slice(0, -1) + flip
}
