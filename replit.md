# Liberia Christian College E-Portal

Mobile-first academic portal for LCC students, staff, administrators, and public document verification.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/lcc-e-portal` — React/Vite portal UI and responsive role-aware navigation
- `artifacts/api-server/src/routes/portal.ts` — session auth, portal APIs, seed accounts, and public verification
- `lib/api-spec/openapi.yaml` — source of truth for generated API hooks and Zod contracts
- `lib/db/src/schema/portal.ts` — Drizzle schema for portal users, sessions, courses, records, and support tickets
- `README.md` — development commands and demo accounts

## Architecture decisions

- Keep the existing pnpm monorepo and Drizzle/PostgreSQL stack rather than introducing a second ORM.
- Use HTTP-only cookie sessions backed by PostgreSQL; the server derives the current user and enforces role permissions.
- Keep public document verification separate from authenticated portal data and never return the document holder's private name.
- Use the supplied LCC mark and a configurable CSS token layer so official branding can be refined later.

## Product

The portal provides a polished mobile-first sign-in experience, role-aware dashboards, course registration, results, fees and payment history, official document records, announcements, support tickets, and public verification.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The frontend Vite config expects `PORT` and `BASE_PATH`; the managed artifact workflow supplies them automatically.
- Re-run API codegen after changing `lib/api-spec/openapi.yaml`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
