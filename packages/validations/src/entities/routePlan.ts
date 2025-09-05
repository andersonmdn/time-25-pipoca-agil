import { z } from 'zod'
import {
  idInt,
  latSchema,
  lngSchema,
  optionalTrim,
  requireAtLeastOneField,
} from '../shared/helpers'

export const routePlanSchema = z.object({
  userId: idInt,
  name: optionalTrim,
  originLat: latSchema,
  originLng: lngSchema,
  destLat: latSchema,
  destLng: lngSchema,
  metadata: z.unknown().optional(),
})

export const routePlanCreateSchema = routePlanSchema
export type RoutePlanCreate = z.infer<typeof routePlanCreateSchema>

export const routePlanUpdateSchema = routePlanSchema.partial().superRefine(requireAtLeastOneField())
export type RoutePlanUpdate = z.infer<typeof routePlanUpdateSchema>

export const routePlanResponseSchema = routePlanSchema.extend({
  id: idInt,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type RoutePlanResponse = z.infer<typeof routePlanResponseSchema>
