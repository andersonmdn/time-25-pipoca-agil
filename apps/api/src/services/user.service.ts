import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'
import { UserResponse, userResponseSchema } from 'packages/validations/dist'

const prisma = new PrismaClient()

export async function findUserByEmail(email: string): Promise<UserResponse | null> {
  const user = await prisma.user.findUnique({ where: { email } })
  return userResponseSchema.nullable().parse(user)
}

export async function createUser(data: { email: string; password: string; name?: string | null; phone?: string | null }): Promise<UserResponse> {
  const passwordHash = await argon2.hash(data.password)
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: passwordHash,
      name: data.name ?? null,
      phone: data.phone ?? null,
    },
  })

  return userResponseSchema.parse(user)
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain)
}

export async function getUsers(): Promise<UserResponse[]> {
  const users = await prisma.user.findMany()

  return userResponseSchema.array().parse(users)
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
