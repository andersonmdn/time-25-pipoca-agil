# 🚗⚡ Pipoca Ágil - Time 25

Plataforma para **descoberta e reserva de pontos de recarga** de veículos elétricos.

---

## 🛠️ Stacks

- **Mobile:**  
  React Native + Expo / TypeScript / Tamagui (UI) / Lucide (Icons) / Zod (Validação)

- **API:**  
  Express / Prisma (ORM) / Pino (Logger) / Typescript / Swagger (Docs) / Zod (Validação) / PostgreSQL (Banco de Dados)

- **Web:**  
  ...existing code...

> ℹ️ **Observação:**  
> As validações com Zod podem ser importadas tanto pela API quanto pelo Mobile através do pacote compartilhado `@chargemap/core`.

---

## 🗂️ Estrutura Monorepo

Este projeto utiliza o padrão **monorepo**, onde múltiplos pacotes (API, Mobile, Web, etc.) compartilham dependências e código em comum.  
Códigos reutilizáveis e validações devem ser implementados em pacotes compartilhados dentro da pasta `packages`, como por exemplo o pacote `packages/validations` para regras de validação Zod utilizadas por diferentes partes do sistema.

---

## 🗄️ Modelo de Dados (Prisma + PostgreSQL)

O projeto utiliza **Prisma** como ORM e **PostgreSQL** como banco de dados.  
A moeda padrão é `BRL` para preços de estação.

---

## 📦 Comandos Úteis

| Comando                                      | Descrição                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| `pnpm install`                               | Instala todas as dependências de todos os pacotes do monorepo.            |
| `pnpm --filter @chargemap/validations build` | Compila o pacote de validações compartilhadas (`@chargemap/validations`). |

---

## 📦 Comandos do pacote API

| Comando                                              | Descrição                                                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `pnpm --filter @chargemap/api dev`                   | Inicia o servidor de desenvolvimento com hot reload e variáveis de ambiente.                      |
| `pnpm --filter @chargemap/api build`                 | Compila o TypeScript e gera o client Prisma.                                                      |
| `pnpm --filter @chargemap/api typecheck`             | Executa apenas a checagem de tipos TypeScript, sem gerar arquivos.                                |
| `pnpm --filter @chargemap/api clean`                 | Remove a pasta de build (`dist`) e dependências (`node_modules`).                                 |
| `pnpm --filter @chargemap/api prisma:generate`       | Gera o client Prisma a partir do schema atual.                                                    |
| `pnpm --filter @chargemap/api prisma:migrate:dev`    | Cria e aplica migrações no banco em ambiente de desenvolvimento.                                  |
| `pnpm --filter @chargemap/api prisma:migrate:deploy` | Aplica migrações em ambiente de produção/deploy.                                                  |
| `pnpm --filter @chargemap/api prisma:migrate:reset`  | Reseta o banco e reaplica todas as migrações.                                                     |
| `pnpm --filter @chargemap/api prisma:studio`         | Abre o Prisma Studio para visualização/edição dos dados.                                          |
| `pnpm --filter @chargemap/api prestart`              | Compila as validações do pacote `@chargemap/validations` e gera o client Prisma antes de iniciar. |
| `pnpm --filter @chargemap/api postinstall`           | Compila as validações e gera o client Prisma após instalar dependências.                          |

---

## 🔔 Integração com Discord

Todas as mudanças realizadas neste projeto são encaminhadas automaticamente para o Discord da Equipe 25 por meio de um WebHook.
