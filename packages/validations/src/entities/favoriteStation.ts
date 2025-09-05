import { z } from 'zod'
import { idInt } from '../shared/helpers'

export const favoriteStationSchema = z.object({
  userId: idInt,
  stationId: idInt,
})

export const favoriteStationCreateSchema = favoriteStationSchema
export type FavoriteStationCreate = z.infer<typeof favoriteStationCreateSchema>

export const favoriteStationResponseSchema = favoriteStationSchema.extend({
  createdAt: z.coerce.date(),
})
