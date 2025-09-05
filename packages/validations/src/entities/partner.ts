import { z } from 'zod'
import { PartnerType } from '../shared/enums'
import {
  emailSchema,
  idInt,
  nonEmptyTrim,
  optionalIdInt,
  phoneSchema,
  urlSchema,
} from '../shared/helpers'

export const partnerSchema = z.object({
  userId: optionalIdInt,
  name: nonEmptyTrim,
  type: PartnerType.default('charging_operator'),
  contactEmail: emailSchema.optional(),
  contactPhone: phoneSchema,
  website: urlSchema.optional(),
})

export const partnerCreateSchema = partnerSchema
export type PartnerCreate = z.infer<typeof partnerCreateSchema>

export const partnerUpdateSchema = partnerSchema.partial().omit({
  userId: true,
})
export type PartnerUpdate = z.infer<typeof partnerUpdateSchema>

export const partnerResponseSchema = partnerSchema.extend({
  id: idInt,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date(),
})
export type PartnerResponse = z.infer<typeof partnerResponseSchema>
