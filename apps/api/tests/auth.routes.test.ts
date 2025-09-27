// // tests/auth.routes.int.test.ts

import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { API_URL, checkApiUrl, createUserAndLogin, dumpOnFail, newEmail } from './utils'

describe('Auth Routes (integração real)', () => {
  beforeAll(() => checkApiUrl())

  describe('POST /login', () => {
    it('Login com credenciais válidas (200)', async () => {
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

    it('Login com payload inválido (400) - Email inválido', async () => {
      const res = await request(API_URL!).post('/login').send({ email: 'invalid', password: 'SenhaF0rte@1' })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toContain('Invalid email address')
      expect(res.body.error).toContain('body/email')
    })

    it('Login com payload inválido (400) - Sem Email', async () => {
      const res = await request(API_URL!).post('/login').send({ password: 'SenhaF0rte@1' })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toContain('Invalid input: expected string, received undefined')
      expect(res.body.error).toContain('body/email')
    })

    it('Login com payload inválido (400) - Sem Senha', async () => {
      const email = newEmail('loginbad')
      const res = await request(API_URL!).post('/login').send({ email })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toContain('Invalid input: expected string, received undefined')
      expect(res.body.error).toContain('body/password')
    })

    it('Login com credenciais inválidas (401)', async () => {
      const email = newEmail('loginbad')
      const password = 'SenhaF0rte@1'
      await request(API_URL!).post('/register').send({ email, password, name: 'Login Bad' }).expect(201)

      const res = await request(API_URL!).post('/login').send({ email, password: 'Errada@123' })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Credenciais inválidas')
    })

    it('Login com payload inválido (400) - JSON malformado', async () => {
      const res = await request(API_URL!).post('/login').set('Content-Type', 'application/json').send('{"email": "x@example.com",') // quebrado

      expect(res.status).toBe(500)
      expect(res.headers['content-type']).toMatch(/application\/json/i)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('JSON malformado')
    })
  })

  describe('POST /refresh', () => {
    it('Refresh token válido (200)', async () => {
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

      const res = await request(API_URL!).post('/refresh').send({ refreshToken })
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('accessToken')
      expect(typeof res.body?.accessToken).toBe('string')
    })

    it('Refresh token ausente (400)', async () => {
      const res = await request(API_URL!).post('/refresh').send({})
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toContain('Invalid input: expected string, received undefined')
      expect(res.body.error).toContain('body/refreshToken')
    })

    it('Refresh token inválido (400) - muito curto', async () => {
      const res = await request(API_URL!).post('/refresh').send({ refreshToken: 'invalid' })
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toContain('Too small: expected string to have >=10 characters')
      expect(res.body.error).toContain('body/refreshToken')
    })

    it('Refresh token inválido ou expirado (401)', async () => {
      const res = await request(API_URL!).post('/refresh').send({ refreshToken: 'tokeninvalido' })
      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Refresh token inválido ou expirado')
    })
  })

  describe('POST /logout', () => {
    it('Realiza logout com accessToken válido (200)', async () => {
      const { accessToken } = await createUserAndLogin()
      const res = await request(API_URL!).post('/logout').set('Authorization', `Bearer ${accessToken}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('ok')
      expect(res.body.ok).toBe(true)
    })
  })
})
