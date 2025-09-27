import z from 'zod'
import { schemaUser } from './user'

export const schemaLoginBody = schemaUser.pick({ email: true, password: true })

export const schemaLoginResponse = z.object({
  user: schemaUser.pick({ id: true, email: true, name: true }),
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const schemaRefreshBody = z.object({
  refreshToken: z.string().min(10),
})

export type Login = z.infer<typeof schemaLoginBody>
export type Refresh = z.infer<typeof schemaRefreshBody>
