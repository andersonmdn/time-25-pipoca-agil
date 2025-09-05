import { z } from 'zod'
import { AmenityType } from '../shared/enums'
import { idInt, requireAtLeastOneField } from '../shared/helpers'

export const stationAmenitySchema = z.object({
  stationId: idInt,
  key: AmenityType,
  value: z.boolean().default(true),
})

export const stationAmenityCreateSchema = stationAmenitySchema
export type StationAmenityCreate = z.infer<typeof stationAmenityCreateSchema>

export const stationAmenityUpdateSchema = stationAmenitySchema
  .partial()
  .superRefine(requireAtLeastOneField())
export type StationAmenityUpdate = z.infer<typeof stationAmenityUpdateSchema>

export const stationAmenityResponseSchema = stationAmenitySchema.extend({
  id: idInt,
})
