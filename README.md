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

## ▶️ Como rodar local

Execute os comandos abaixo no PowerShell (Windows) ou terminal do macOS/Linux:

```sh
pnpm i

# API: precisa de Postgres local rodando
# depois:
pnpm --filter @chargemap/api prisma migrate dev
pnpm --filter @chargemap/api dev

# Mobile (abre dev server, também funciona via web)
pnpm --filter @chargemap/mobile dev
# ou
pnpm --filter @chargemap/mobile web

# Ou tudo junto:
pnpm dev
```

---

## 🔔 Integração com Discord

Todas as mudanças realizadas neste projeto são encaminhadas automaticamente para o Discord da Equipe 25 por meio de um WebHook.
