import { z } from 'zod'
import { emailSchema, idInt, optionalTrim, passwordSchema } from '../shared/helpers'

export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const loginUserSchema = z.object({
  id: idInt,
  email: emailSchema,
  name: optionalTrim,
})
export type LoginUser = z.infer<typeof loginUserSchema>

export const loginResponseSchema = z.object({
  user: loginUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
})
export type LoginResponse = z.infer<typeof loginResponseSchema>
