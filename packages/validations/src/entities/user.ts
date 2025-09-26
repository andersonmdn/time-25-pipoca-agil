import { z } from 'zod'
import { UserRole } from '../shared/enums'
import { emailSchema, idInt, optionalTrim, passwordSchema, phoneSchema, requireAtLeastOneField } from '../shared/helpers'

export const userIdParamSchema = z.object({ id: idInt })

export const userSchema = z.object({
  email: emailSchema,
  name: optionalTrim,
  role: UserRole.default('user'),
  phone: phoneSchema,
  password: passwordSchema,
})

export const userCreateSchema = userSchema
export type UserCreate = z.infer<typeof userCreateSchema>

export const userUpdateSchema = userSchema.partial().superRefine(requireAtLeastOneField())
export type UserUpdate = z.infer<typeof userUpdateSchema>

export const userResponseSchema = userSchema.extend({
  id: idInt,
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type UserResponse = z.infer<typeof userResponseSchema>

// Schema público sem o campo senha
export const userResponseSchemaPublic = userResponseSchema.omit({ password: true })
export type UserResponsePublic = z.infer<typeof userResponseSchemaPublic>
