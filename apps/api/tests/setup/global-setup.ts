import dotenv from 'dotenv'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { createApp } from '../../src/app'
import { loadEnv } from '../../src/config/env'
import { logger } from '../../src/logger'
import { createUser } from '../../src/services/user.service'

const API_URL = 'http://localhost:3000'

export default async function () {
  // const envPath = path.resolve(process.cwd(), '.env.test')
  // if (fs.existsSync(envPath)) dotenv.config({ path: envPath })
  dotenv.config({ path: '.env.test' })
  const env = loadEnv()
  const app = createApp()
  const PORT = env.PORT

  app.listen(PORT, () => {
    logger.info({ port: PORT }, `API rodando em http://localhost:${PORT}`)
  })

  // // roda migrações (ou push)
  // execSync('npx prisma db push', { stdio: 'inherit' })

  // Dropa e recria o banco de dados
  logger.info('Resetando o banco de dados de teste...')
  execSync(`npx prisma migrate reset --force --skip-seed`, { stdio: 'inherit' })
  logger.info('Banco de dados de teste resetado.')

  // 1) Garante um usuário fixo de teste
  logger.info('Criando usuário de teste...')
  const res = await request(API_URL).post('/register').send({
    email: 'Vitest@vitest.com',
    password: 'Senha123@',
    name: 'Vitest User',
  })

  if (res.status !== 201) {
    throw new Error(`Falha ao criar usuário de teste: ${res.status} ${res.text}`)
  }

  logger.info('Salvando variáveis de ambiente para testes...')
  process.env.ACCESS_TOKEN = res.body.accessToken
  process.env.TEST_USER_EMAIL = String(res.body.user.email)
  process.env.TEST_USER_PASSWORD = String(res.body.user.password)
  process.env.TEST_USER_ID = String(res.body.user.id)
  process.env.API_URL = API_URL

  // 2) Garante um Usuário Admin fixo de teste
  logger.info('Criando usuário Admin de teste...')
  const adminUser = await createUser({
    email: 'Admin@vitest.com',
    password: 'Senha123@',
    name: 'Admin User',
    role: 'admin',
  })

  if (!adminUser) {
    console.log('Falha ao criar usuário Admin de teste')
    console.log(adminUser)
    throw new Error('Falha ao criar usuário Admin de teste')
  }

  const resAdmin = await request(API_URL).post('/login').send({
    email: 'Admin@vitest.com',
    password: 'Senha123@',
  })

  if (resAdmin.status !== 200) {
    throw new Error(`Falha ao logar usuário Admin de teste: ${resAdmin.status} ${resAdmin.text}`)
  }

  logger.info('Salvando variáveis de ambiente do Admin para testes...')
  process.env.ADMIN_USER_EMAIL = String(adminUser.email)
  process.env.ADMIN_USER_PASSWORD = String(adminUser.password)
  process.env.ADMIN_USER_ID = String(adminUser.id)
  process.env.ADMIN_ACCESS_TOKEN = resAdmin.body.accessToken
  process.env.ADMIN_REFRESH_TOKEN = resAdmin.body.refreshToken

  logger.info('Global setup concluído.')
}
