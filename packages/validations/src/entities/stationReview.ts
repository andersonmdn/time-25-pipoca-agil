import { z } from 'zod'
import { idInt, optionalTrim, requireAtLeastOneField, urlArrSchema } from '../shared/helpers'

export const stationReviewSchema = z.object({
  userId: idInt,
  stationId: idInt,
  rating: z.coerce.number().int().min(1).max(5),
  title: optionalTrim,
  comment: optionalTrim,
  photos: urlArrSchema,
})
export const stationReviewCreateSchema = stationReviewSchema
export type StationReviewCreate = z.infer<typeof stationReviewCreateSchema>

export const stationReviewUpdateSchema = stationReviewSchema
  .partial()
  .superRefine(requireAtLeastOneField())
export type StationReviewUpdate = z.infer<typeof stationReviewUpdateSchema>

export const stationReviewResponseSchema = stationReviewSchema.extend({
  id: idInt,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
