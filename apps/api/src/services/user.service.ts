import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(data: { email: string; password: string; name?: string | null; phone?: string | null }) {
  const passwordHash = await argon2.hash(data.password)
  return prisma.user.create({
    data: {
      email: data.email,
      password: passwordHash,
      name: data.name ?? null,
      phone: data.phone ?? null,
    },
  })
}

export async function verifyPassword(hash: string, plain: string) {
  return argon2.verify(hash, plain)
}

export async function getUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, phone: true, createdAt: true },
  })
}
