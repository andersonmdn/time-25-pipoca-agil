import { z } from 'zod'
import { idInt, optionalDecimal2, optionalTrim, requireAtLeastOneField } from '../shared/helpers'

export const stationPriceTierSchema = z
  .object({
    stationId: idInt,
    name: optionalTrim,
    pricePerKWh: optionalDecimal2,
    pricePerMinute: optionalDecimal2,
    sessionFee: optionalDecimal2,
    currency: z.string().trim().min(3).max(3).default('BRL'),
    dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
    startHour: z.coerce.number().int().min(0).max(23).optional(),
    endHour: z.coerce.number().int().min(0).max(23).optional(),
    isDynamic: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    // Se um dos horários for informado, exigir ambos
    if ((v.startHour !== undefined) !== (v.endHour !== undefined)) {
      ctx.addIssue({ code: 'custom', message: 'startHour e endHour devem ser informados juntos' })
    }
    if (v.startHour !== undefined && v.endHour !== undefined && v.startHour === v.endHour) {
      ctx.addIssue({ code: 'custom', message: 'startHour e endHour não podem ser iguais' })
    }
  })

export const stationPriceTierCreateSchema = stationPriceTierSchema
export type StationPriceTierCreate = z.infer<typeof stationPriceTierCreateSchema>

export const stationPriceTierUpdateSchema = stationPriceTierSchema.partial().superRefine(requireAtLeastOneField())
export type StationPriceTierUpdate = z.infer<typeof stationPriceTierUpdateSchema>

export const stationPriceTierResponseSchema = stationPriceTierSchema.safeExtend({
  id: idInt,
  createdAt: z.date(),
  updatedAt: z.date(),
})
