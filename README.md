# Liberia Christian College E-Portal

Mobile-first academic portal for Liberia Christian College with role-aware dashboards, course registration, results, finance records, official documents, announcements, support tickets, and public document verification.

## Development

The app is split into a React/Vite frontend and the shared Express API service:

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/lcc-e-portal run dev
```

The project uses PostgreSQL through Drizzle ORM. The schema is in `lib/db/src/schema/` and can be pushed with:

```bash
pnpm --filter @workspace/db run push
```

## Data and access

The API does not create accounts, courses, announcements, payments, or documents automatically. Connect the portal to your institution's records before inviting users.

For an isolated local preview only, set `PORTAL_SEED_DATA=development` when starting the API. This is intentionally opt-in and should never be enabled for a production deployment.

Every authenticated route is role-scoped for students, staff, administrators, and super administrators. The frontend only presents the navigation available to the signed-in role, and the API enforces the same access boundary.