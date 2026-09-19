# Liberia Christian College E-Portal

Mobile-first academic portal for Liberia Christian College with role-aware dashboards, course registration, results, finance records, official documents, announcements, support tickets, and public document verification.

## Development

The app is split into a React/Vite frontend and the shared Express API service:

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/lcc-e-portal run dev
```

The project uses the preconfigured PostgreSQL database through Drizzle ORM. The schema is in `lib/db/src/schema/` and can be pushed with:

```bash
pnpm --filter @workspace/db run push
```

## Development accounts

These accounts are seeded automatically in the development database. Change them before using a production deployment.

| Role | Email | Development password |
| --- | --- | --- |
| Super Admin | `superadmin@lcc.edu.lr` | `LCC-Super-2026!` |
| Admin | `admin@lcc.edu.lr` | `LCC-Admin-2026!` |
| Staff | `staff@lcc.edu.lr` | `LCC-Staff-2026!` |
| Student | `student@lcc.edu.lr` | `LCC-Student-2026!` |

## Public verification

Open `/verify` and use the seeded development document number `LCC-REG-2026-001` to view a public verification result. Private holder information is not exposed.