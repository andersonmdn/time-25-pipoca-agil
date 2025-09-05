import { z } from 'zod'
import { NotificationType } from '../shared/enums'
import { idInt, nonEmptyTrim } from '../shared/helpers'

export const notificationSchema = z.object({
  userId: idInt,
  type: NotificationType.default('general'),
  title: nonEmptyTrim,
  body: nonEmptyTrim,
  data: z.unknown().optional(), // JSON livre
})

export const notificationCreateSchema = notificationSchema
export type NotificationCreate = z.infer<typeof notificationCreateSchema>

export const notificationResponseSchema = notificationSchema.extend({
  id: idInt,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
