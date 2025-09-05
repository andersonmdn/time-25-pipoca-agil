import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { AnyZodObject } from 'zod/v3'

/**
 * Middleware para validar o corpo da requisição usando um schema Zod.
 * @param schema - O schema Zod para validação.
 * @returns Função middleware do Express.
 */
export function validateBody(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({ error: 'validation_error', issues: e.flatten() })
      }
      next(e)
    }
  }
}
