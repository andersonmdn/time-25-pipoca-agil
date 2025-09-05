# Banco de Dados — Visão Geral (Prisma + PostgreSQL)

Este documento resume o **modelo de dados** do projeto. O ORM utilizado é **Prisma** e o banco é **PostgreSQL**.

## Stack & Configuração

- **ORM:** Prisma (`generator client = prisma-client-js`)
- **Banco:** PostgreSQL (`datasource db`)
- **Conexão:** variável de ambiente `DATABASE_URL`
- **Moeda padrão:** `BRL` em preços de estação

---

## Entidades Principais

| Domínio          | Tabelas                                                      | Descrição rápida                                                                             |
| ---------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| **Usuários**     | `User`, `Vehicle`                                            | Usuário final, com veículos (tipo de plug, apelido).                                         |
| **Estações**     | `Station`, `Connector`, `StationPriceTier`, `StationAmenity` | Estações de recarga, seus conectores, tarifas (por kWh/minuto/taxa de sessão) e comodidades. |
| **Descoberta**   | `FavoriteStation`, `StationReview`                           | Favoritos e reviews com rating 1..5 e fotos.                                                 |
| **Notificações** | `Notification`                                               | Notificações por tipo (booking, loyalty, etc.).                                              |
| **Problemas**    | `IssueReport`                                                | Relatos de indisponibilidade/defeitos por usuário ou operador.                               |
| **Parceiros**    | `Partner`                                                    | Donos/operadores das estações (opcionalmente vinculados a um `User`).                        |
| **Rotas**        | `RoutePlan`, `RouteWaypoint`                                 | Planejamento de rotas multi-pontos, waypoints referenciando estações.                        |

---

**Soft delete:**

- `Station.deletedAt` e `Partner.deletedAt` permitem “desativar” sem apagar dados. Regra de negócio deve filtrar `deletedAt IS NULL` + `isActive`.

---

## Enums (tipos controlados)

- **UserRole:** `user | partner | admin`
- **PlugType:** `CCS2 | Type2 | CHAdeMO | GB_T | Tesla`
- **ConnectorStatus:** `available | occupied | offline | maintenance`
- **BookingStatus:** `pending | confirmed | canceled | expired | completed | no_show` _(reservas futuras)_
- **ChargeSessionStatus:** `started | finished | canceled | failed` _(sessões futuras)_
- **NotificationType:** `booking_created | booking_reminder | booking_canceled | station_issue_update | loyalty_reward | general`
- **IssueType:** `station_offline | connector_broken | price_mismatch | blocked_access | other`
- **IssueStatus:** `open | in_progress | resolved | dismissed`
- **PartnerType:** `charging_operator | retail | hospitality | automotive | other`
- **LoyaltyEventType / RewardType** _(para fidelidade futura)_
- **AmenityType:** `restroom | wifi | parking | food_drink | shopping | lounge | pet_friendly`

---

## Índices & Unicidades Importantes

- `User.email` **único**
- `FavoriteStation` **único** por `[userId, stationId]`
- `StationAmenity` **único** por `[stationId, key]`
- Índices comuns:
  `Vehicle.userId`, `Connector.stationId`, `Connector.priceTierId`,
  `StationPriceTier.stationId`, `StationPriceTier(dayOfWeek, startHour, endHour)`,
  `StationReview.stationId`, `StationReview.userId`,
  `Notification(userId, createdAt)`,
  `IssueReport.stationId | reporterId | ownerId`,
  `RouteWaypoint(routeId, seq)`

---

## Tarifas & Janela de Preço

`StationPriceTier` permite tarifação por:

- `pricePerKWh`, `pricePerMinute`, `sessionFee` (qualquer combinação)
- **Janela opcional**: `dayOfWeek` (0–6), `startHour`, `endHour`
- `isDynamic` para sinalizar precificação dinâmica

Conectores podem apontar para um `priceTier` específico (ou herdar lógica da estação no serviço).

---

## Regras de Negócio (resumo)

- **Ativação de estação:** `Station.isActive` + `deletedAt` controlam visibilidade.
- **Avaliações:** `ratingAvg`/`ratingCount` mantêm agregados; recalcular ao inserir/editar review.
- **Issues:** workflow via `IssueStatus`; responsável opcional (`ownerId`).
- **Favoritos:** chave única impede duplicidade.

---

## Operacional (Prisma)

```bash
# gerar client após alterar schema
pnpm --filter @chargemap/api prisma:generate

# criar e aplicar migrações em dev
pnpm --filter @chargemap/api prisma:migrate:dev

# abrir Prisma Studio
pnpm --filter @chargemap/api prisma:studio
```

**Variáveis:** configure `DATABASE_URL` no `.env`.

<!-- **Sempre que alterar o schema do Prisma, lembre-se de atualizar o ER Diagram:**

https://prisma-erd.simonknott.de/ -->

---

## Estrutura Monorepo

Este projeto faz parte de um **monorepo** gerenciado com [pnpm workspaces](https://pnpm.io/workspaces). O pacote da API está localizado em `apps/api` e pode ser referenciado nos comandos usando o filtro `--filter @chargemap/api`.

### Comandos do pacote API

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

## Roadmap (campos já previstos)

- **Bookings / ChargeSessions / Loyalty**: enums e relacionamentos já preparados para evolução futura sem breaking changes.

---

> **Resumo:** o modelo foca em **experiência do usuário** (favoritos, reviews, notificações), **operação de estações** (conectores, tarifas, comodidades), **qualidade de serviço** (issues) e **planejamento de rotas** — com deleções cuidadosas (soft delete/SetNull) para preservar histórico.
