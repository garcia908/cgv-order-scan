# CGV Snack Order

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

- **CGV Snack Order** (`artifacts/cgv-snack-order`) — Mobile-first web app for CGV snack ordering. Routes: `/`, `/menu`, `/cart`, `/payment`, `/success`, and `/staff`. UI in Bahasa Indonesia, CGV red branding. Orders are sent to Telegram and are not stored; the success receipt is kept only in the current browser session. The staff page retains QR-code tools but does not show order history.
- **API Server** (`artifacts/api-server`) — Express 5 API that validates orders and sends Telegram notifications. It does not require a database.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Local Development

Set `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY` in the workspace-root `.env`. The `.env` file is ignored by Git; never commit its values.

Run these commands in separate terminals from the workspace root:

1. `pnpm --filter @workspace/api-server dev` — builds and starts the API on port 3000.
2. `pnpm --filter @workspace/cgv-snack-order dev` — starts the frontend on port 5173 and proxies `/api` requests to the local API.

Open `http://localhost:5173`. Order submission requires the API and valid Telegram settings. No PostgreSQL or other database is used. To view an order, use the success page immediately after placing it; order history and staff order management are unavailable in Telegram-only mode.

## Vercel Deployment

Connect the repository to Vercel with the workspace root as the project root. The included `vercel.json` configures the build and API routes. Add the same five environment variables in the Vercel project's Environment Variables settings; do not commit `.env` or paste secret values into source files.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
