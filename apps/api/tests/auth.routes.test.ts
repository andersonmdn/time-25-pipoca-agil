// // tests/auth.routes.int.test.ts

import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { API_URL, checkApiUrl, dumpOnFail, newEmail } from './utils'

// async function resolveLoginPath(): Promise<'/login'> {
//   if (!API_URL) throw new Error('API_URL indefinido.')
//   if (loginPathCache) return loginPathCache

//   // tenta /auth/login
//   let probe = await request(API_URL).post('/auth/login').send({})
//   if (![404, 405].includes(probe.status)) {
//     loginPathCache = '/auth/login'
//     return loginPathCache
//   }
//   // tenta /login
//   probe = await request(API_URL).post('/login').send({})
//   if (![404, 405].includes(probe.status)) {
//     loginPathCache = '/login'
//     return loginPathCache
//   }
//   throw new Error('Nenhuma rota de login encontrada (/auth/login ou /login)')
// }

// async function resolveRefreshPath(): Promise<'/refresh'> {
//   if (!API_URL) throw new Error('API_URL indefinido.')
//   if (refreshPathCache) return refreshPathCache

//   // tenta /auth/refresh
//   let probe = await request(API_URL).post('/refresh').send({})
//   if (![404, 405].includes(probe.status)) {
//     refreshPathCache = '/auth/refresh'
//     return refreshPathCache
//   }
//   // tenta /refresh
//   probe = await request(API_URL).post('/refresh').send({})
//   if (![404, 405].includes(probe.status)) {
//     refreshPathCache = '/refresh'
//     return refreshPathCache
//   }
//   throw new Error('Nenhuma rota de refresh encontrada (/auth/refresh ou /refresh)')
// }

// /**
//  * Cria usuário e faz login para obter tokens reais
//  */
// async function createUserAndLogin(): Promise<{ id: number; email: string; accessToken: string; refreshToken?: string }> {
//   if (!API_URL) throw new Error('API_URL indefinido.')
//   const email = newEmail('auth')
//   const password = 'SenhaF0rte@1'

//   // registra
//   const reg = await request(API_URL).post('/register').send({
//     email,
//     password,
//     name: 'Auth Tester',
//     phone: '+55 11999999999',
//   })
//   if (reg.status !== 201) {
//     dumpOnFail(reg, 201)
//     throw new Error('Falha ao registrar usuário de teste para auth.')
//   }

//   // tenta pegar tokens direto do /register
//   let accessToken = extractAccessToken(reg.body)
//   let refreshToken = extractRefreshToken(reg.body)

//   if (!accessToken) {
//     // login
//     const loginPath = await resolveLoginPath()
//     const login = await request(API_URL).post(loginPath).send({ email, password })
//     if (login.status !== 200) {
//       dumpOnFail(login, 200)
//       throw new Error('Falha ao fazer login.')
//     }
//     accessToken = extractAccessToken(login.body)
//     refreshToken = extractRefreshToken(login.body)
//   }

//   if (!accessToken) {
//     throw new Error('accessToken não encontrado após registro/login.')
//   }

//   const id: number = reg.body?.user?.id ?? reg.body?.id ?? reg.body?.userId
//   return { id, email, accessToken, refreshToken }
// }

describe('Auth Routes (integração real)', () => {
  beforeAll(() => checkApiUrl())

  describe('POST /login', () => {
    it('Realiza login com credenciais válidas (200)', async () => {
      const email = newEmail('loginok')
      const password = 'SenhaF0rte@1'
      const reg = await request(API_URL!).post('/register').send({ email, password, name: 'Login Ok' })
      expect(reg.status).toBe(201)

      const res = await request(API_URL!).post('/login').send({ email, password })

      dumpOnFail(res, 200)
      expect(res.status).toBe(200)
      expect(res).toHaveProperty('body')
      expect(res.body).toHaveProperty('user')
      expect(res.body.user).toHaveProperty('id')
      expect(res.body.user).toHaveProperty('email')
      expect(res.body.user).toHaveProperty('name')
      expect(res.body).toHaveProperty('accessToken')
      expect(res.body).toHaveProperty('refreshToken')
    })

    it('Retorna 400 para payload inválido', async () => {
      const res = await request(API_URL!).post('/login').send({ email: 'invalid' })
      expect(res.status).toBe(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toContain('Invalid input: expected string, received undefined')
      expect(res.body.error).toContain('at password')
    })

    it('Retorna 401 para senha incorreta', async () => {
      const email = newEmail('loginbad')
      const password = 'SenhaF0rte@1'
      await request(API_URL!).post('/register').send({ email, password, name: 'Login Bad' }).expect(201)

      const res = await request(API_URL!).post('/login').send({ email, password: 'Errada@123' })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Credenciais inválidas')
    })

    it('Retorna 400 para JSON malformado', async () => {
      const res = await request(API_URL!).post('/login').set('Content-Type', 'application/json').send('{"email": "x@example.com",') // quebrado

      expect(res.status).toBe(400)
      expect(res.headers['content-type']).toMatch(/application\/json/i)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('JSON malformado')
    })
  })

  describe('POST /refresh', () => {
    it('Rotaciona accessToken com refresh válido (body ou header)', async () => {
      const email = newEmail('refresh')
      const reg = await request(API_URL!).post('/register').send({
        email,
        password: 'SenhaF0rte@1',
        name: 'Ref',
        phone: '+55 11988887777',
      })

      expect(reg.status).toBe(201)
      expect(reg.body).toHaveProperty('refreshToken')

      const refreshToken = reg.body.refreshToken as string

      console.log('Usando refreshToken:', refreshToken)

      // Testa envio no corpo
      const resBody = await request(API_URL!).post('/refresh').send({ refreshToken })
      expect(resBody.status).toBe(200)
      expect(resBody.body).toHaveProperty('accessToken')
      expect(typeof resBody.body?.accessToken).toBe('string')

      // Testa envio no header
      const resHeader = await request(API_URL!).post('/refresh').set('x-refresh-token', refreshToken).send()
      expect(resHeader.status).toBe(200)
      expect(resHeader.body).toHaveProperty('accessToken')
      expect(typeof resHeader.body?.accessToken).toBe('string')
    })

    it('Retorna 400 quando o refresh token está ausente', async () => {
      const res = await request(API_URL!).post('/refresh').send({})
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Token de atualização ausente')
    })

    it('Retorna 401 para refresh token inválido', async () => {
      const res = await request(API_URL!).post('/refresh').send({ refreshToken: 'invalid' })
      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Refresh token inválido ou expirado')
    })
  })
})
