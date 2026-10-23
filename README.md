# happysm

happysm is a private, consent-first health and lifestyle companion. It helps people review habits they choose to share and offers gentle, educational routine ideas. It does not diagnose conditions or provide medical advice.

## What works in this MVP

- Managed account sign-in through Replit's Clerk setup.
- A questionnaire that asks for consent before every save.
- Private profile storage tied to the signed-in account.
- A dashboard with self-reported values, educational reflections, and a BMI estimate only when both height and weight are available.
- A weekly routine based on the goals the user selected.
- Responsive landing, sign-in, profile, dashboard, and schedule pages.

The app stores health information only after consent. API routes verify the signed-in account and only read or update that account's profile. Health information is not written into request logs. The Replit database is protected through server-side authorization; this MVP does not use Supabase or database-level RLS.

## Current limitations

- This project uses React + Vite and Replit's managed database, not Next.js and Supabase.
- Managed Clerk sign-in currently uses email/password with email verification codes. GitHub sign-in is supported when enabled in the Replit Auth pane. LinkedIn sign-in is not supported by this managed setup.
- PDF report storage/downloads, email notifications, and the creator-only Health Validation Lab are not included in this MVP.
- This is an MVP, not a clinically validated or regulatory-compliant medical product. Do not use it for urgent or personal medical decisions.

## Run and check the app

The Replit workflows start the web app and API server for you. For changes, these checks are available:

```bash
pnpm run typecheck
pnpm --filter @workspace/api-server run test
```

The API test suite covers BMI availability, the no-profile state, and goal-based schedule generation. It does not replace account-isolation or end-to-end testing.
The Replit artifact workflow supplies `PORT` and `BASE_PATH` to the web build; publish through Replit rather than running the Vite build command without those values.

## Data and environment setup

In Replit, the database connection and Clerk development credentials are provisioned for the project. Do not commit credentials or paste them into source files. Do not request secrets through chat.

When running outside Replit, the current app is not standalone: it depends on the workspace API server, a PostgreSQL `DATABASE_URL`, the Replit-managed Clerk setup, and Replit's routing environment. Configure equivalent services and secure environment variables before attempting an external deployment.

The profile table is defined in `lib/db/src/schema/healthProfiles.ts`. Apply development schema changes with:

```bash
pnpm --filter @workspace/db run push
```

The API contract lives in `lib/api-spec/openapi.yaml`. After changing it, regenerate client and validation types:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Publishing

For this version, use Replit's Publish flow. Development and production Clerk environments are separate, and the production environment must be configured before real users sign in.

### About Vercel

This workspace is not ready for a direct Vercel deployment. The frontend is one package in a pnpm monorepo, the API runs as a separate Express service, the database is Replit-managed, and authentication uses Replit-managed Clerk credentials and proxy routing.

To move the app to Vercel, first plan a migration: host the frontend and API as compatible deployments, connect a database you manage, create/configure a Clerk instance for the new deployment, migrate the schema and data deliberately, and update API routing and auth domains. Do not copy Replit-managed secrets into Vercel or publish health data during migration. Verify privacy boundaries before directing users to the new deployment.

## Main project paths

- `artifacts/happysm/` — web app
- `artifacts/api-server/` — authenticated API and health guidance
- `lib/db/src/schema/healthProfiles.ts` — private profile schema
- `lib/api-spec/openapi.yaml` — API contract
