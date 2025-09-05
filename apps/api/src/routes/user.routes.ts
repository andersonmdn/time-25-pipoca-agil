import { userCreateSchema, userIdParamSchema, userResponseSchema, userUpdateSchema } from '@chargemap/validations'
import { Router } from 'express'
import z from 'zod'
import { signAccessToken, signRefreshToken } from '../auth/jwt'
import { requireAuth } from '../auth/middleware'
import { createUser, findUserByEmail, getUsers, updateUser } from '../services/user.service'

const router = Router()

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
 *                       type: string
 *                       example: "123"
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
  if (!body.success) return res.status(400).json({ error: z.treeifyError(body.error) })
  const { email, password, name, phone } = body.data

  const exists = await findUserByEmail(email)
  if (exists) return res.status(409).json({ error: 'Email já registrado' })

  const user = await createUser({ email, password, name, phone })
  const payload = { id: String(user.id), email: user.email }
  return res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name },
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  })
})

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Listar usuários
 *     description: Retorna todos os usuários cadastrados. Requer autenticação com Bearer token JWT.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "123"
 *                       email:
 *                         type: string
 *                         example: "user@example.com"
 *                       name:
 *                         type: string
 *                         example: "João da Silva"
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
  const users = await getUsers()

  const usersResponse = users.map((user) => userResponseSchema.parse(user))
  if (!usersResponse) return res.status(404).json({ error: 'Usuários não encontrados' })

  return res.status(200).json({ users: usersResponse })
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
 *           type: string
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "123"
 *                     email:
 *                       type: string
 *                       example: "usuario.atualizado@example.com"
 *                     name:
 *                       type: string
 *                       example: "Nome Atualizado"
 *                     phone:
 *                       type: string
 *                       example: "+55 11999999999"
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
  if (!params.success) return res.status(400).json({ error: z.treeifyError(params.error) })

  const { id } = params.data

  const body = userUpdateSchema.safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: z.treeifyError(body.error) })
  const { email, password, name, phone } = body.data

  const user = await updateUser(id, { email, password, name, phone })
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })

  const userResponse = userResponseSchema.parse(user)
  if (!userResponse) return res.status(404).json({ error: 'Usuário não encontrado' })

  return res.status(200).json({ user: userResponse })
})

export default router
