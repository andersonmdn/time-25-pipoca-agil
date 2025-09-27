import dotenv from 'dotenv'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { createApp } from '../../src/app'
import { loadEnv } from '../../src/config/env'
import { logger } from '../../src/logger'
import { createUser } from '../../src/services/user.service'

const API_URL = 'http://localhost:3000'

export default async function () {
  dotenv.config({ path: '.env.test' })

  const env = loadEnv()
  const PORT = Number(env.PORT ?? 3000)
  const API_URL = `http://localhost:${PORT}`

  // ⚠️ No Windows, evite gerar o client durante o reset (causa EPERM)
  // Gere o client antes (ex.: no postinstall) e pule o generate aqui:
  logger.info('Resetando o banco de testes...')
  execSync('npx prisma migrate reset --force --skip-generate', { stdio: 'inherit' })

  // Sobe a API **na mesma porta** que os testes vão usar
  logger.info(`Subindo API para testes em ${API_URL}...`)
  const app = await createApp()
  await app.listen({ port: PORT, host: '0.0.0.0' })
  ;(globalThis as any).__APP__ = app // guarda para teardown opcional

  // Cria um usuário comum de teste via service (evita flutuação de rota)
  logger.info('Criando usuário de teste...')
  const testUser = await createUser({
    email: 'tester@vitest.com',
    password: 'Senha123@',
    name: 'Tester',
  })

  // Faz login para obter tokens (testa a rota real /login)
  logger.info('Logando usuário de teste...')
  const res = await request(API_URL).post('/login').send({
    email: testUser.email,
    password: 'Senha123@',
  })

  if (res.status !== 200) {
    throw new Error(`Falha no login do usuário de teste: ${res.status} ${res.text}`)
  }

  // Admin fixo (se você precisar em vários testes)
  logger.info('Criando usuário Admin de teste...')
  const adminUser = await createUser({
    email: 'Admin@vitest.com',
    password: 'Senha123@',
    name: 'Admin User',
    role: 'admin',
  })

  const resAdmin = await request(API_URL).post('/login').send({
    email: adminUser.email,
    password: 'Senha123@',
  })

  if (resAdmin.status !== 200) {
    throw new Error(`Falha ao logar Admin: ${resAdmin.status} ${resAdmin.text}`)
  }

  // Exporta para os testes
  process.env.API_URL = API_URL
  process.env.TEST_USER_EMAIL = String(testUser.email)
  process.env.TEST_USER_PASSWORD = 'Senha123@'
  process.env.TEST_USER_ID = String(testUser.id)
  process.env.ACCESS_TOKEN = res.body.accessToken

  process.env.ADMIN_USER_EMAIL = String(adminUser.email)
  process.env.ADMIN_USER_PASSWORD = 'Senha123@'
  process.env.ADMIN_USER_ID = String(adminUser.id)
  process.env.ADMIN_ACCESS_TOKEN = resAdmin.body.accessToken
  process.env.ADMIN_REFRESH_TOKEN = resAdmin.body.refreshToken

  logger.info('Global setup concluído.')
}
