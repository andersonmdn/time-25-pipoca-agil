// tests/user.routes.int.test.ts
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { API_URL, checkApiUrl, createUserAndLogin, dumpOnFail, getAccessToken, getAdminAccessToken, getTestUserId, newEmail, tamper } from './utils'

function expectISODate(value: any) {
  const d = new Date(value)
  expect(isNaN(d.getTime())).toBe(false)
  // opcional: validar formato ISO com regex simples (sem timezone estrito)
  expect(String(value)).toMatch(/\d{4}-\d{2}-\d{2}T/)
}

describe('User Routes', () => {
  beforeAll(() => {
    checkApiUrl()
  })

  describe('POST /register', () => {
    it('Registra novo usuário e retorna tokens (201)', async () => {
      const email = newEmail('register')
      const res = await request(API_URL!).post('/register').send({
        email,
        password: 'ExemploSenha@123',
        name: 'Test',
        phone: '+55 11987654321',
      })
      dumpOnFail(res, 201)
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('user')
      expect(res.body.user).toMatchObject({ email, name: 'Test' })
      expect(res.body).not.toHaveProperty('user.password')
      expect(res.body).toHaveProperty('accessToken')
      expect(typeof res.body.accessToken).toBe('string')
      expect(res.body).toHaveProperty('refreshToken')
      expect(typeof res.body.refreshToken).toBe('string')
    })

    it('Registros simultâneos com mesmo email: 1 sucesso, 1 conflito', async () => {
      const email = newEmail('race')
      const body = { email, password: 'SenhaF0rte@1', name: 'Race', phone: '+55 11999999999' }

      const [a, b] = await Promise.all([request(API_URL!).post('/register').send(body), request(API_URL!).post('/register').send(body)])

      const statuses = [a.status, b.status].sort()
      expect(statuses).toEqual([201, 409])
    })

    it('Normaliza email (case/trim) e detecta duplicidade (409)', async () => {
      const base = newEmail('sanitize')
      await request(API_URL!)
        .post('/register')
        .send({
          email: base,
          password: 'Aa@123456',
          name: 'A',
          phone: '+55 11911111111',
        })
        .expect(201)

      const res = await request(API_URL!)
        .post('/register')
        .send({
          email: `  ${base.toUpperCase()}  `,
          password: 'Aa@123456',
          name: '  Test  ',
          phone: '+55 11911111112',
        })
      expect(res.status).toBe(409)
      expect(res.body).toHaveProperty('error')
    })

    it('Retorna 400 para JSON malformado', async () => {
      const res = await request(API_URL!).post('/register').set('Content-Type', 'application/json').send('{"email": "x@example.com",') // quebrado
      expect(res.status).toBe(400)
      expect(res.headers['content-type']).toMatch(/application\/json/i)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('JSON malformado')
    })

    it('Valida campos (email inválido e senha ausente) -> 400', async () => {
      const res = await request(API_URL!).post('/register').send({ email: 'invalid' })
      dumpOnFail(res, 400)
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(typeof res.body.error).toBe('string')
      expect(res.body.error).toContain('Invalid email address')
      expect(res.body.error).toContain('at email')
      expect(res.body.error).toContain('expected string')
      expect(res.body.error).toContain('at password')
    })
  })

  describe('GET /users (protegida)', () => {
    it('Retorna 200 com token válido sem metadados', async () => {
      const token = await getAccessToken()
      const res = await request(API_URL!).get('/users').set('Authorization', `Bearer ${token}`)
      dumpOnFail(res, 200)
      expect(res.status).toBe(200)
      // Espera que a resposta tenha "data" (array de usuários) e "meta" (objeto de paginação detalhado)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThanOrEqual(1)
      for (const user of res.body.data) {
        expect(user).toHaveProperty('id')
        expect(user).toHaveProperty('email')
        expect(user).toHaveProperty('name')
        expect(user).toHaveProperty('role')
        expect(user).toHaveProperty('phone')
        expect(user).not.toHaveProperty('password')
        expect(user).toHaveProperty('createdAt')
        expect(user).toHaveProperty('updatedAt')
      }
      expect(res.body).toHaveProperty('meta')
      expect(typeof res.body.meta).toBe('object')
      expect(res.body.meta).toMatchObject({
        page: 1,
        limit: expect.any(Number),
        total: expect.any(Number),
        pages: expect.any(Number),
        hasNext: expect.any(Boolean),
        hasPrev: expect.any(Boolean),
        sort: expect.any(String),
        order: expect.any(String),
      })
    })

    it('Retorna 401 sem token de autorização', async () => {
      const res = await request(API_URL!).get('/users?limit=1&page=1')
      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Cabeçalho de autorização ausente ou inválido')
    })

    it('Rejeita token adulterado (401/403)', async () => {
      const token = await getAccessToken()
      const bad = tamper(token)
      const res = await request(API_URL!).get('/users?limit=1&page=1').set('Authorization', `Bearer ${bad}`)
      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Token inválido ou expirado')
    })

    it('Datas em ISO-8601 e content-type JSON', async () => {
      const token = await getAccessToken()
      const res = await request(API_URL!).get('/users?limit=1&page=1').set('Authorization', `Bearer ${token}`)
      expect(res.headers['content-type']).toMatch(/application\/json/i)
      const u = res.body.data?.[0]
      expectISODate(u.createdAt)
      expectISODate(u.updatedAt)
    })

    it('Lista paginada com metadados (se suportado)', async () => {
      const token = await getAccessToken()
      const res = await request(API_URL!).get('/users?limit=1&page=1').set('Authorization', `Bearer ${token}`)
      // se sua API ainda não suporta meta, não quebre: apenas verifique opcionalmente
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.meta).toMatchObject({
        page: expect.any(Number),
        limit: expect.any(Number),
        total: expect.any(Number),
        pages: expect.any(Number),
        hasNext: expect.any(Boolean),
        hasPrev: expect.any(Boolean),
        sort: expect.any(String),
        order: expect.any(String),
      })
    })
  })

  describe('PUT /users/:id (protegida)', () => {
    it('Atualiza o próprio usuário (200)', async () => {
      const { id, accessToken } = await createUserAndLogin()
      const res = await request(API_URL!).put(`/users/${id}`).set('Authorization', `Bearer ${accessToken}`).send({ name: 'Updated Name' })

      dumpOnFail(res, 200)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('user')
      expect(res.body.user).not.toHaveProperty('password')
      expect(res.body.user.id).toBe(Number(id))
      expect(res.body.user.name).toBe('Updated Name')
    })

    it('Retorna 400 para parâmetros inválidos (id não numérico)', async () => {
      const token = await getAccessToken()
      const res = await request(API_URL!).put('/users/invalid').set('Authorization', `Bearer ${token}`).send({ name: 'Updated' })
      expect(res.status).toBe(400)
    })

    it('Nega atualizar outro usuário 403', async () => {
      const { accessToken } = await createUserAndLogin()
      const testUserId = await getTestUserId()
      const res = await request(API_URL!).put(`/users/${testUserId}`).set('Authorization', `Bearer ${accessToken}`).send({ name: 'Hacker' })
      expect(res.status).toBe(403)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Acesso negado')
    })

    it('Usuário inexistente -> 404', async () => {
      const token = await getAdminAccessToken()
      const idFake = 9_999_999
      const res = await request(API_URL!).put(`/users/${idFake}`).set('Authorization', `Bearer ${token}`).send({ name: 'Nobody' })
      expect([404]).toContain(res.status)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Usuário não encontrado')
    })

    it('Idempotência: repetir PUT com mesmo body mantém 200 e dados', async () => {
      const { id, accessToken } = await createUserAndLogin()
      const body = { name: 'Same Name' }

      const a = await request(API_URL!).put(`/users/${id}`).set('Authorization', `Bearer ${accessToken}`).send(body)
      const b = await request(API_URL!).put(`/users/${id}`).set('Authorization', `Bearer ${accessToken}`).send(body)

      expect(a.status).toBe(200)
      expect(b.status).toBe(200)
      expect(a.body.user.name).toBe('Same Name')
      expect(b.body.user.name).toBe('Same Name')
    })

    it('Ignora campos proibidos (ex.: role) -> 200', async () => {
      const { id, accessToken } = await createUserAndLogin()
      const res = await request(API_URL!)
        .put(`/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ role: 'admin', password: 'UpdatedPass@1' })
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('user')
      expect(res.body.user).not.toHaveProperty('password')
      expect(res.body.user).toHaveProperty('role', 'user')
    })

    // it('Sanitiza/rejeita XSS básico no name -> 400/200 dependendo da política', async () => {
    //   const { id, accessToken } = await createUserAndLogin()
    //   const res = await request(API_URL!)
    //     .put(`/users/${id}`)
    //     .set('Authorization', `Bearer ${accessToken}`)
    //     .send({ name: '<script>alert(1)</script>' })

    //   // Se você sanitiza -> 200 e name limpo; se rejeita -> 400.
    //   expect([200, 400]).toContain(res.status)
    // })

    it('Retorna 401/403 sem autenticação', async () => {
      const res = await request(API_URL!).put('/users/1').send({ name: 'X' })
      expect([401, 403]).toContain(res.status)
    })
  })
})
