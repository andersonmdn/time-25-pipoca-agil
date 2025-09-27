import { z } from 'zod'
import { PlugType } from '../shared/enums'
import { idInt, optionalTrimSchema, requireAtLeastOneField } from '../shared/helpers'

export const vehicleSchema = z.object({
  userId: idInt,
  alias: optionalTrimSchema,
  brand: optionalTrimSchema,
  model: optionalTrimSchema,
  plug: PlugType,
})

export const vehicleCreateSchema = vehicleSchema
export type VehicleCreate = z.infer<typeof vehicleCreateSchema>

export const vehicleUpdateSchema = vehicleSchema.partial().superRefine(requireAtLeastOneField())
export type VehicleUpdate = z.infer<typeof vehicleUpdateSchema>

export const vehicleResponseSchema = vehicleSchema.extend({
  id: idInt,
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type VehicleResponse = z.infer<typeof vehicleResponseSchema>
