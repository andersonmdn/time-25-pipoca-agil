import { z } from 'zod'
import { idInt, requireAtLeastOneField } from '../shared/helpers'

export const routeWaypointSchema = z.object({
  routeId: idInt,
  seq: z.coerce.number().int().min(0),
  stationId: idInt,
})

export const routeWaypointCreateSchema = routeWaypointSchema
export type RouteWaypointCreate = z.infer<typeof routeWaypointCreateSchema>

export const routeWaypointUpdateSchema = routeWaypointSchema
  .partial()
  .superRefine(requireAtLeastOneField())
export type RouteWaypointUpdate = z.infer<typeof routeWaypointUpdateSchema>

export const routeWaypointResponseSchema = routeWaypointSchema.extend({
  id: idInt,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type RouteWaypointResponse = z.infer<typeof routeWaypointResponseSchema>
