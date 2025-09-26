/**
 * @swagger
 * components:
 *   schemas:
 *     UserPublic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 123
 *         email:
 *           type: string
 *           example: "usuario@example.com"
 *         name:
 *           type: string
 *           example: "Maria Souza"
 *         phone:
 *           type: string
 *           example: "+55 11987654321"
 */
import { userCreateSchema, userIdParamSchema, userResponseSchemaPublic, userUpdateSchema } from '@chargemap/validations'
import { Prisma } from '@prisma/client'
import { Router } from 'express'
import z from 'zod'
import { signAccessToken, signRefreshToken } from '../auth/jwt'
import { requireAuth } from '../auth/middleware'
import { createUser, getUsersPaginated, updateUser } from '../services/user.service'

const router = Router()

const listQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(['createdAt', 'name', 'email']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * @swagger
 * /register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registrar novo usuário
 *     description: Cria um novo usuário no sistema e retorna tokens de autenticação.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "novo.usuario@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SenhaSegura123!"
 *               name:
 *                 type: string
 *                 example: "Maria Souza"
 *               phone:
 *                 type: string
 *                 example: "+55 11987654321"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     email:
 *                       type: string
 *                       example: "novo.usuario@example.com"
 *                     name:
 *                       type: string
 *                       example: "Maria Souza"
 *                 accessToken:
 *                   type: string
 *                   description: Token JWT de acesso
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   description: Token JWT de atualização
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Erro de validação nos dados enviados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "O campo email é obrigatório"
 *       409:
 *         description: Email já registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email já registrado"
 */
router.post('/register', async (req, res) => {
  const body = userCreateSchema.safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: z.prettifyError(body.error) })
  const { email, password, name, phone } = body.data

  try {
    const user = await createUser({ email, password, name, phone })
    const payload = { id: String(user.id), email: user.email, role: 'user' as const }

    return res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    })
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ error: 'Email já registrado' })
    }

    return res.status(500).json({ error: 'Erro ao registrar' })
  }
})

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Listar usuários
 *     description: Retorna uma lista paginada de usuários. Requer autenticação com Bearer token JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Página atual
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Quantidade de usuários por página
 *       - name: sort
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [createdAt, name, email]
 *           default: createdAt
 *         description: Campo para ordenação
 *       - name: order
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordem de ordenação
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserPublic'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 42
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     pages:
 *                       type: integer
 *                       example: 5
 *                     hasNext:
 *                       type: boolean
 *                       example: true
 *                     hasPrev:
 *                       type: boolean
 *                       example: false
 *                     sort:
 *                       type: string
 *                       example: createdAt
 *                     order:
 *                       type: string
 *                       example: desc
 *       400:
 *         description: Erro de validação nos parâmetros de consulta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Parâmetro inválido"
 *       401:
 *         description: Token ausente, inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token inválido ou expirado"
 */
router.get('/users', requireAuth, async (req, res) => {
  const q = listQuery.safeParse(req.query)
  if (!q.success) {
    return res.status(400).json({ error: z.prettifyError(q.error) })
  }
  const { page, limit, sort, order } = q.data

  const { users, total } = await getUsersPaginated({ page, limit, sort, order })
  const data = users.map((u) => userResponseSchemaPublic.parse(u))

  const pages = Math.ceil(total / limit) || 1
  const hasNext = page < pages
  const hasPrev = page > 1

  return res.status(200).json({
    data,
    meta: { total, page, limit, pages, hasNext, hasPrev, sort, order },
  })
})

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Atualizar usuário
 *     description: Atualiza os dados de um usuário existente. Requer autenticação com Bearer token JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario.atualizado@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "NovaSenha123!"
 *               name:
 *                 type: string
 *                 example: "Nome Atualizado"
 *               phone:
 *                 type: string
 *                 example: "+55 11999999999"
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserPublic'
 *       400:
 *         description: Erro de validação nos dados enviados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "O campo email é obrigatório"
 *       401:
 *         description: Token ausente, inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token inválido ou expirado"
 *       403:
 *         description: Acesso negado. Usuário tentando atualizar outro usuário sem permissão.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Acesso negado"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuário não encontrado"
 */
router.put('/users/:id', requireAuth, async (req, res) => {
  const params = userIdParamSchema.safeParse(req.params)
  if (!params.success) return res.status(400).json({ error: z.prettifyError(params.error) })

  const { id } = params.data

  const requester = req.user
  const requesterId = Number(requester?.id)
  const isAdmin = requester?.role === 'admin'
  if (requesterId !== id && !isAdmin) {
    return res.status(403).json({ error: 'Acesso negado' })
  }

  const body = userUpdateSchema.safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: z.prettifyError(body.error) })
  const { email, password, name, phone } = body.data

  try {
    const user = await updateUser(id, { email, password, name, phone })
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

    const userResponse = userResponseSchemaPublic.parse(user)
    if (!userResponse) return res.status(404).json({ error: 'Usuário não encontrado' })

    return res.status(200).json({ user: userResponse })
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ error: 'Email já registrado' })
    }

    return res.status(500).json({ error: 'Erro ao registrar' })
  }
})

export default router
