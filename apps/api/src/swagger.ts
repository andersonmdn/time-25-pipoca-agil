import { Express } from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { loadEnv } from './config/env'
import { logger } from './logger'

const env = loadEnv()

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API do Projeto do Time 25',
      version: '1.0.0',
      description: 'Documentação da API usando Swagger',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
}

const swaggerSpec = swaggerJsdoc(options)

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  logger.info(`Swagger UI disponível em http://localhost:${env.PORT}/api-docs`)
}
