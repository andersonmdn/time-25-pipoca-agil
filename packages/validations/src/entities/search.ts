import { z } from 'zod'
import { ConnectorStatus, PlugType } from '../shared/enums'
import { latSchema, lngSchema, optionalTrim, paginationSchema } from '../shared/helpers'

export const stationSearchQuerySchema = paginationSchema.extend({
  q: z.string().trim().optional(),
  city: optionalTrim,
  state: optionalTrim,
  country: optionalTrim,
  plug: PlugType.optional(),
  status: ConnectorStatus.optional(), // para buscas agregadas por status do conector
  nearLat: latSchema.optional(),
  nearLng: lngSchema.optional(),
  radiusKm: z.coerce.number().positive().max(200).optional(),
})

export type StationSearchQuery = z.infer<typeof stationSearchQuerySchema>
