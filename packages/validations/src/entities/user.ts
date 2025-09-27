import { z } from 'zod'
import { UserRole } from '../shared/enums'
import { emailSchema, idInt, nameSchema, passwordSchema, phoneSchema } from '../shared/helpers'

export const schemaUser = z.object({
  id: idInt,
  email: emailSchema,
  name: nameSchema,
  role: UserRole.default('user'),
  phone: phoneSchema,
  password: passwordSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Update
export const schemaUserUpdateParams = schemaUser.pick({ id: true })
export const schemaUserUpdateBody = schemaUser.pick({ email: true, name: true, phone: true, password: true }).partial()
// Select
export const schemaUserSelectResponsePublic = schemaUser.omit({ password: true })
// List
export const schemaUserListBody = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.enum(['createdAt', 'name', 'email']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const schemaUserListResponse = z.object({
  data: z.array(
    schemaUser.pick({
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    }),
  ),
  meta: z.object({
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    pages: z.number().int(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
    sort: z.enum(['createdAt', 'name', 'email']),
    order: z.enum(['asc', 'desc']),
  }),
})

// Create
export const schemaUserCreateBody = schemaUser.omit({ id: true, createdAt: true, updatedAt: true })
export const schemaUserCreateResponse = z.object({
  user: schemaUser.pick({ id: true, email: true, name: true }),
  accessToken: z.string(),
  refreshToken: z.string(),
})

// Types
export type User = z.infer<typeof schemaUser>
export type UserUpdateParams = z.infer<typeof schemaUserUpdateParams>
export type UserUpdateBody = z.infer<typeof schemaUserUpdateBody>
export type UserListBody = z.infer<typeof schemaUserListBody>
export type UserCreateBody = z.infer<typeof schemaUserCreateBody>
