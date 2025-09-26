import { UserResponse, userResponseSchema } from '@chargemap/validations'
import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'
import z from 'zod'
import { logger } from '../logger'

const prisma = new PrismaClient()

export async function findUserByEmail(email: string): Promise<UserResponse | null> {
  const user = await prisma.user.findUnique({ where: { email } })
  const result = userResponseSchema.nullable().safeParse(user)

  if (!result.success) {
    logger.error({ user }, `Dados inconsistentes no banco sendo retornados. \nFunction: findUserByEmail \n${z.prettifyError(result.error)}`)
    return null
  }

  return result.data
}

export async function createUser(data: {
  email: string
  password: string
  name?: string | null
  phone?: string | null
  role?: 'user' | 'admin' | 'partner'
}): Promise<UserResponse> {
  const passwordHash = await argon2.hash(data.password)
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      password: passwordHash,
      name: data.name ?? null,
      phone: data.phone ?? null,
      role: data.role ?? 'user',
    },
  })

  const result = userResponseSchema.safeParse(user)
  if (!result.success) {
    logger.error({ user }, `Dados inconsistentes no banco sendo retornados. \nFunction: createUser \n${z.prettifyError(result.error)}`)
    return Promise.reject(new Error('Dados inconsistentes no banco sendo retornados.'))
  }

  return result.data
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain)
}

export async function getUsers(): Promise<UserResponse[]> {
  const users = await prisma.user.findMany()

  return userResponseSchema.array().parse(users)
}

export async function getUsersPaginated({
  limit,
  page,
  sort,
  order,
}: {
  limit: number
  page: number
  sort: 'createdAt' | 'name' | 'email'
  order: 'asc' | 'desc'
}): Promise<{ users: UserResponse[]; total: number }> {
  const skip = (page - 1) * limit
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { id: 'asc' },
    }),
    prisma.user.count(),
  ])
  return {
    users: userResponseSchema.array().parse(users),
    total,
  }
}

export async function updateUser(
  id: number,
  data: { email?: string; password?: string; name?: string | null; phone?: string | null },
): Promise<UserResponse> {
  const updateData: any = { ...data }
  if (data.password) {
    updateData.password = await argon2.hash(data.password)
  }
  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  })

  return userResponseSchema.parse(user)
}
