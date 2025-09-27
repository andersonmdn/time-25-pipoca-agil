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

    it('Registra novo usuário com email sanitizado (201)', async () => {
      const base = newEmail('sanitize')
      await request(API_URL!)
        .post('/register')
        .send({
          email: base,
          password: 'Aa@123456',
          name: 'Abc',
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

    it('Registra novo usuário com email sanitizado (201)', async () => {
      const res = await request(API_URL!).post('/register').set('Content-Type', 'application/json').send('{"email": "x@example.com",')

      expect(res.status).toBe(500)
      expect(res.headers['content-type']).toMatch(/application\/json/i)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('JSON malformado')
    })

    it('Registra novo usuário com email ausente, senha ausente, nome ausente (400)', async () => {
      const res = await request(API_URL!).post('/register').send({})

      dumpOnFail(res, 400)
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(typeof res.body.error).toBe('string')
      expect(res.body.error).toContain('Invalid input: expected string, received undefined')
      expect(res.body.error).toContain('body/password')
      expect(res.body.error).toContain('body/name')
      expect(res.body.error).toContain('body/email')
    })

    it('Registra novo usuário com email inválido, senha ausente, nome ausente (400)', async () => {
      const res = await request(API_URL!).post('/register').send({ email: 'invalid' })

      dumpOnFail(res, 400)
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(typeof res.body.error).toBe('string')
      expect(res.body.error).toContain('Invalid input: expected string, received undefined')
      expect(res.body.error).toContain('Invalid email address')
      expect(res.body.error).toContain('body/password')
      expect(res.body.error).toContain('body/name')
      expect(res.body.error).toContain('body/email')
    })

    it('Registra novo usuário com telefone ausente (201)', async () => {
      const email = newEmail('nophone')
      const res = await request(API_URL!).post('/register').send({ email, password: 'Aa@123456', name: 'Abc' })

      dumpOnFail(res, 201)
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('user')
      expect(res.body.user.id).toBeGreaterThanOrEqual(1)
      expect(res.body.user.name).toBe('Abc')
      expect(res.body.user.email).toBe(email)
      expect(res.body.user).not.toHaveProperty('password')
      expect(res.body).toHaveProperty('accessToken')
      expect(typeof res.body.accessToken).toBe('string')
      expect(res.body).toHaveProperty('refreshToken')
      expect(typeof res.body.refreshToken).toBe('string')
    })
  })

  describe('GET /users (protegida)', () => {
    it('Lista usuários (200) - Limite Ausente', async () => {
      const token = await getAccessToken()
      const res = await request(API_URL!).get('/users').set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(1)
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

    it('Lista paginada com metadados - Limite 1', async () => {
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

    it('Lista usuários sem token (401)', async () => {
      const res = await request(API_URL!).get('/users?limit=1&page=1')
      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Cabeçalho de autorização ausente ou inválido')
    })

    it('Lista usuários com token adulterado (401)', async () => {
      const token = await getAccessToken()
      const bad = tamper(token)
      const res = await request(API_URL!).get('/users?limit=1&page=1').set('Authorization', `Bearer ${bad}`)
      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Token inválido ou expirado')
    })

    it('Lista usuários (200) - Verifica CreatedAt e UpdatedAt', async () => {
      const token = await getAccessToken()
      const res = await request(API_URL!).get('/users?limit=1&page=1').set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toMatch(/application\/json/i)
      const u = res.body.data?.[0]
      expectISODate(u.createdAt)
      expectISODate(u.updatedAt)
    })
  })

  describe('PUT /users/:id (protegida)', () => {
    it('Atualiza o próprio usuário (200)', async () => {
      const { id, accessToken } = await createUserAndLogin()
      const res = await request(API_URL!).put(`/users/${id}`).set('Authorization', `Bearer ${accessToken}`).send({ name: 'Updated Name' })

      dumpOnFail(res, 200)
      expect(res.status).toBe(200)
      expect(res.body).not.toHaveProperty('password')
      expect(res.body.id).toBeGreaterThanOrEqual(1)
      expect(res.body).toHaveProperty('email')
      expect(res.body).toHaveProperty('name')
      expect(res.body).toHaveProperty('role')
      expect(res.body).toHaveProperty('phone')
      expect(res.body).toHaveProperty('createdAt')
      expect(res.body).toHaveProperty('updatedAt')
      expect(res.body.name).toBe('Updated Name')
    })

    it('Atualiza usuário com ID inválido (400)', async () => {
      const token = await getAccessToken()
      const res = await request(API_URL!).put('/users/invalid').set('Authorization', `Bearer ${token}`).send({ name: 'Updated' })
      expect(res.status).toBe(400)
    })

    it('Atualiza usuário com ID diferente do próprio (403) - Hacker', async () => {
      const { accessToken } = await createUserAndLogin()
      const testUserId = await getTestUserId()
      const res = await request(API_URL!).put(`/users/${testUserId}`).set('Authorization', `Bearer ${accessToken}`).send({ name: 'Hacker' })
      expect(res.status).toBe(403)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Acesso negado')
    })

    it('Atualiza usuário com ID inexistente (404) - Admin', async () => {
      const token = await getAdminAccessToken()
      const idFake = 9_999_999
      const res = await request(API_URL!).put(`/users/${idFake}`).set('Authorization', `Bearer ${token}`).send({ name: 'Nobody' })
      expect([404]).toContain(res.status)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Usuário não encontrado')
    })

    it('Atualiza usuário com ID igual ao próprio (200) - Idempotência', async () => {
      const { id, accessToken } = await createUserAndLogin()
      const body = { name: 'Same Name' }

      const a = await request(API_URL!).put(`/users/${id}`).set('Authorization', `Bearer ${accessToken}`).send(body)
      const b = await request(API_URL!).put(`/users/${id}`).set('Authorization', `Bearer ${accessToken}`).send(body)

      expect(a.status).toBe(200)
      expect(b.status).toBe(200)
      expect(a.body.name).toBe('Same Name')
      expect(b.body.name).toBe('Same Name')
    })

    it('Atualiza usuário com role de admin e nova senha (200) - Não Altera', async () => {
      const { id, accessToken } = await createUserAndLogin()
      const res = await request(API_URL!)
        .put(`/users/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ role: 'admin', password: 'UpdatedPass@1' })

      expect(res.status).toBe(200)
      expect(res.body).not.toHaveProperty('password')
      expect(res.body).toHaveProperty('role', 'user')
      expect(res.body.role).toBe('user')
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

    it('Atualiza usuário sem autenticação (401)', async () => {
      const res = await request(API_URL!).put('/users/1').send({ name: 'Updated Name' })
      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Cabeçalho de autorização ausente ou inválido')
    })
  })
})
