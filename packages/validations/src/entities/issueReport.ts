import { z } from 'zod'
import { IssueStatus, IssueType } from '../shared/enums'
import {
  idInt,
  nonEmptyTrim,
  optionalIdInt,
  optionalTrim,
  requireAtLeastOneField,
  urlArrSchema,
} from '../shared/helpers'

export const issueReportCreateSchema = z.object({
  reporterId: idInt,
  ownerId: optionalIdInt,
  stationId: idInt,
  connectorId: optionalIdInt,
  type: IssueType.default('other'),
  status: IssueStatus.default('open'),
  title: nonEmptyTrim,
  description: optionalTrim,
  photos: urlArrSchema,
})
export type IssueReportCreate = z.infer<typeof issueReportCreateSchema>

export const issueReportUpdateSchema = z
  .object({
    ownerId: optionalIdInt,
    connectorId: optionalIdInt,
    type: IssueType.optional(),
    status: IssueStatus.optional(),
    title: nonEmptyTrim.optional(),
    description: optionalTrim,
    photos: urlArrSchema.optional(),
  })
  .superRefine(requireAtLeastOneField())
export type IssueReportUpdate = z.infer<typeof issueReportUpdateSchema>
