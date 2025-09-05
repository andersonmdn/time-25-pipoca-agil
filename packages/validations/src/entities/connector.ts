import { z } from 'zod'
import { ConnectorStatus, PlugType } from '../shared/enums'
import { idInt, optionalIdInt, requireAtLeastOneField } from '../shared/helpers'

export const connectorSchema = z.object({
  stationId: idInt,
  plug: PlugType,
  powerKW: z.coerce.number().positive().optional(),
  status: ConnectorStatus.default('available'),
  priceTierId: optionalIdInt,
})

export const connectorCreateSchema = connectorSchema
export type ConnectorCreate = z.infer<typeof connectorCreateSchema>

export const connectorUpdateSchema = connectorSchema.partial().superRefine(requireAtLeastOneField())
export type ConnectorUpdate = z.infer<typeof connectorUpdateSchema>

export const connectorResponseSchema = connectorSchema.extend({
  id: idInt,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type ConnectorResponse = z.infer<typeof connectorResponseSchema>
