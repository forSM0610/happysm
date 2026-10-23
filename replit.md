# happysm

A private, consent-first health and lifestyle companion for self-reported habits, educational reflections, and practical routines.

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

- `artifacts/happysm/` — React + Vite web app and Clerk auth routes
- `artifacts/api-server/src/routes/healthProfile.ts` — authenticated profile, dashboard, and schedule routes
- `artifacts/api-server/src/lib/healthGuidance.ts` — educational insight and schedule generation
- `lib/db/src/schema/healthProfiles.ts` — user-owned profile records
- `lib/api-spec/openapi.yaml` — source of truth for API contracts and generated hooks
- `README.md` — setup, limitations, checks, and deployment notes

## Architecture decisions

- Replit PostgreSQL and managed Clerk were selected for the MVP instead of Supabase, so ownership is enforced by authenticated server routes rather than Supabase RLS.
- The app only presents educational reflections; it does not generate diagnoses, medical risk scores, or guaranteed outcomes.
- Health profiles are not seeded with sample records, and profile writes require fresh consent.
- BMI is displayed only when both height and weight exist, without health-category labels.

## Product

- Users can sign in, consent to saving optional health and lifestyle details, review their own information, see limited educational insights, and receive a goal-based weekly routine.
- PDF reports, email notifications, and the creator-only Validation Lab are intentionally outside the first MVP.

## User preferences

- Explain major steps simply; the user is a beginner and expects incremental delivery.
- Do not claim diagnoses, health risk scores, or guaranteed health outcomes.

## Gotchas

- Replit-managed Clerk supports email/password with email verification codes and GitHub when enabled; LinkedIn is not supported in this setup.
- Do not expose profile data in logs or return it unless the request has a valid Clerk session.
- Run API code generation after changing `lib/api-spec/openapi.yaml`.
- Use Replit Publish for this setup; Vercel requires a deliberate auth, API, and database migration.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
