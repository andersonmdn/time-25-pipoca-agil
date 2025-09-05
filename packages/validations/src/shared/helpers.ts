import { z } from 'zod'

/**
 * Helpers comuns
 * Validações reutilizáveis
 * coerce: Conversão de tipos
 */
export const idInt = z.coerce.number().int().positive() // ID inteiro positivo
export const optionalIdInt = idInt.optional() // ID inteiro positivo opcional

export const nonEmptyTrim = z.string().trim().min(1) // string não vazia
export const optionalTrim = z.string().trim().optional() // string não vazia opcional

export const passwordSchema = z.string().min(6) // senha com no mínimo 6 caracteres
export const emailSchema = z.string().email() // email válido
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[\d\s()+\-\.]{8,20}$/, 'telefone inválido')
  .optional() // telefone inválido opcional

export const urlSchema = z.string().url()
export const urlArrSchema = z.array(urlSchema).max(20).default([])

export const latSchema = z.coerce.number().min(-90).max(90)
export const lngSchema = z.coerce.number().min(-180).max(180)

/**
 * Valida se pelo menos um campo está presente
 * @param message Mensagem de erro personalizada
 * @returns Um validador Zod
 */
export const requireAtLeastOneField =
  (message = 'informe ao menos um campo') =>
  (val: Record<string, unknown>, ctx: z.RefinementCtx) => {
    const hasAny = Object.values(val).some((v) => v !== undefined)
    if (!hasAny) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message })
    }
  }

/**
 * Validação de valor monetário opcional. Aceita número ou string com 2 casas decimais; transforma para number
 */
export const optionalDecimal2 = z
  .union([
    z.coerce.number().finite(),
    z
      .string()
      .regex(/^\d+([.,]\d{1,2})?$/, 'valor monetário inválido')
      .transform((s) => parseFloat(s.replace(',', '.'))),
  ])
  .transform((n) => Number(n))
  .refine((n) => n >= 0, 'não pode ser negativo')
  .optional()

/**
 * Validação de paginação e ordenação
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  sortBy: z.string().trim().optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
})
