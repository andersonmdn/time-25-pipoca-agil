import { z } from 'zod'
import {
  latSchema,
  lngSchema,
  nonEmptyTrim,
  optionalIdInt,
  optionalTrim,
  phoneSchema,
  requireAtLeastOneField,
  urlArrSchema,
  urlSchema,
} from '../shared/helpers'

export const stationBase = z.object({
  name: nonEmptyTrim,
  description: optionalTrim,
  latitude: latSchema,
  longitude: lngSchema,
  addressLine1: optionalTrim,
  addressLine2: optionalTrim,
  city: optionalTrim,
  state: optionalTrim,
  country: optionalTrim,
  postalCode: optionalTrim,
  openingHours: z.unknown().optional(), // JSON livre
  phone: phoneSchema,
  website: urlSchema.optional(),
  photos: urlArrSchema,
  isActive: z.boolean().optional(),
  ownerId: optionalIdInt,
})

export const stationCreateSchema = stationBase
export type StationCreate = z.infer<typeof stationCreateSchema>

export const stationUpdateSchema = stationBase.partial().superRefine(requireAtLeastOneField())
export type StationUpdate = z.infer<typeof stationUpdateSchema>

export const stationResponseSchema = stationBase.extend({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type StationResponse = z.infer<typeof stationResponseSchema>
