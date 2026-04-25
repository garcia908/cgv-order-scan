# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

- **CGV Snack Order** (`artifacts/cgv-snack-order`) — Mobile-first trial web app for QR-table self-ordering at CGV cinema snack bar. Routes: `/` landing, `/menu`, `/cart`, `/payment` (QRIS / VA BCA / VA Mandiri), `/success`, `/staff` (dashboard with CSV export). UI in Bahasa Indonesia, CGV red branding. Cart state in zustand+localStorage; orders persisted via API server (PostgreSQL + Drizzle). Staff dashboard fetches via React Query hooks and auto-refreshes every 5s, exporting CSV from real DB rows.
- **API Server** (`artifacts/api-server`) — Express 5 + Drizzle. `/api/orders` CRUD + `/api/orders/:id/status` PATCH + `/api/orders/summary` for dashboard stats. Order schema in `lib/db/src/schema/orders.ts` (jsonb items column).

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
