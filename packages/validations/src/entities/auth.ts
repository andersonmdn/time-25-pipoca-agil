import { z } from 'zod'
import { emailSchema, passwordSchema } from '../shared/helpers'

export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})
