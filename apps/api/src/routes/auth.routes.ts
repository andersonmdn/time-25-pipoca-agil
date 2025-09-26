import { authSchema } from '@chargemap/validations'
import { Router } from 'express'
import z from 'zod'
import { signAccessToken, signRefreshToken, verifyRefresh } from '../auth/jwt'
import { logger } from '../logger'
import { findUserByEmail, verifyPassword } from '../services/user.service'

const router = Router()

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Fazer login
 *     description: Autentica o usuário com email e senha e retorna tokens JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "novo.usuario@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SenhaSegura123!"
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', async (req, res) => {
  const body = authSchema.safeParse(req.body)
  if (!body.success) return res.status(400).json({ error: z.prettifyError(body.error) })
  const { email, password } = body.data

  const user = await findUserByEmail(email)
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' })

  const ok = await verifyPassword(user.password, password)
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' })

  const payload = { id: String(user.id), email: user.email, role: user.role }
  res.json({
    user: { id: user.id, email: user.email, name: user.name },
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  })
})

/**
 * @swagger
 * /refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Renovar token de acesso
 *     description: Gera um novo accessToken a partir de um refreshToken válido.
 *       O refreshToken pode ser enviado no corpo da requisição ou no header `x-refresh-token`.
 *     parameters:
 *       - in: header
 *         name: x-refresh-token
 *         required: false
 *         schema:
 *           type: string
 *         description: Refresh token JWT.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token JWT.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Novo token de acesso gerado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Novo token JWT de acesso.
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Token de atualização ausente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token de atualização ausente"
 *       401:
 *         description: Refresh token inválido ou expirado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Refresh token inválido ou expirado"
 */

router.post('/refresh', async (req, res) => {
  const token = (req.body?.refreshToken ?? req.headers['x-refresh-token']) as string | undefined
  logger.info({ token: !!token }, 'Recebida requisição de refresh token')
  if (!token) {
    logger.warn('Token de atualização ausente na requisição')
    return res.status(400).json({ error: 'Token de atualização ausente' })
  }
  try {
    const payload = verifyRefresh(token)
    logger.info({ userId: payload.id, email: payload.email }, 'Refresh token válido, gerando novo accessToken')
    const accessToken = signAccessToken(payload)
    res.json({ accessToken })
  } catch (e) {
    logger.error({ e }, 'Erro ao renovar token:')
    res.status(401).json({ error: 'Refresh token inválido ou expirado' })
  }
})

export default router
