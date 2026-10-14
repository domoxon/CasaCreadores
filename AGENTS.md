# Casa Creadores — Guide for AI coding agents

Read this before touching anything. It covers what the product is, the rules that must
not be broken, and how to run and test everything.

## What this is

LATAM UGC creator network for crypto/fintech/tech brands. Spanish-language UI.
One Vercel project serves everything (npm workspaces):

| Path | Stack | Role |
|---|---|---|
| `apps/web` | React 18 + Vite + Tailwind + shadcn/ui | Static site, built to `apps/web/dist` |
| `apps/api` | Express + Prisma + PostgreSQL | API, compiled to `apps/api/dist` |
| `api/index.js` | Vercel Node function | Wraps the Express app; all `/api/*` is rewritten here |
| `packages/shared` | TS types | Used by web and api |
| Email | Resend HTTP API (`apps/api/src/lib/mailer.ts`) | `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL` |
| `scripts/vercel-build.mjs` | Build | Builds all; production only: `prisma migrate deploy` + internal accounts |

Database: Neon Postgres via the Vercel Marketplace (`DATABASE_URL` pooled,
`DATABASE_URL_UNPOOLED` direct for migrations). Production: https://casacreadores.vercel.app

`docs/strategy/` holds the business docs (01–11). `legacy/nextjs-v1/` is the first,
design-only Next.js version — archived, not built or deployed. Don't edit it.

## Golden rules — do not break these

1. **Brands never get accounts.** No brand registration, no brand login links anywhere
   public. Brands use `/contacto`; the team manages their campaigns internally.
   **Creators never self-register either:** they apply at `/aplicar`; the team gets an email
   with a `/revisar/:token` link, approves, and the creator gets `/activar/:token` to set a
   password. `POST /api/auth/register` is closed (403) unless `ALLOW_OPEN_SIGNUP=true`.
   Email links must never perform actions on GET (mail scanners open links) — actions are POSTs
   from the page. The `/marca` route (MARCA role) is an internal ops tool,
   deliberately unlinked from public navigation — keep it that way.
2. **The API is same-origin.** The browser calls `/api/*` on the site's own domain;
   `vercel.json` rewrites it to `api/index.js`. Do not add client-side calls to another
   API host or cross-origin retries.
3. **Email verification stays disabled** (`isEmailDeliveryConfigured()` returns `false`)
   until a real email provider is implemented in `apps/api/src/lib/email.ts`.
   `sendVerificationEmail` is a stub that only logs; enabling verification without real
   sending makes every signup hang forever on "check your email".
4. In `apps/web/src/pages/Diagnostics.tsx`, keep the 502/503/504 check **before** the
   content-type check (Vercel error pages are HTML).
5. UI language is Spanish. Keep new user-facing copy in Spanish.
6. **Migrations run only on production builds.** Never point a preview at a different
   schema expectation without a migration; add migrations with `npm run db:migrate` locally.

## Local setup

Requirements: Node 20+, PostgreSQL 16 (Docker or local install).

```bash
npm install
docker compose up -d          # postgres user:password@localhost:5432/casa_creadores
cp .env.example .env          # fill JWT_*; DATABASE_URL and DATABASE_URL_UNPOOLED identical locally
npm run db:migrate            # create tables
npm run db:seed               # demo data (local only)
npm run dev                   # api :4000 + web :5173
```

The web dev server calls `http://localhost:4000/api` automatically.

Seed accounts (local only): `admin@casacreadores.com / admin123` → `/admin`,
`marca@casacreadores.demo / marca123` → `/marca`, `creador1@casacreadores.demo / creador123` → `/creador`.
Production accounts come from `ADMIN_*` / `OPS_*` env vars. Never commit real credentials.

## Manual test checklist

Creator flow:
1. `/aplicar` → submit application → team email arrives with "Revisar solicitud"
2. `/revisar/:token` → Aprobar → creator email with "Crear mi cuenta" (link also shown on page)
3. `/activar/:token` → set password → lands on `/creador`, profile pre-filled and approved
3. Open a campaign → "Aplicar a esta campaña" → badge "Ya aplicaste · PENDING"
4. Log out, log back in → same account and data

Content + payout flow (creator selected for a campaign):
- `/campanas/:id` → "Tu entrega": submit Drive/Dropbox link → admin approves or requests changes
  in `/admin/campanas/:id` → creator pastes live post URL → admin "Verificar publicado" →
  payout becomes DUE → admin "Marcar como pagado" (amount + tx hash/reference).
- Creators keep payout details (crypto wallet + network, Binance Pay, bank, Wise) on `/creador`.
  Content files are never stored by us — only links.

Public/brand flow:
5. `/` renders hero, stats, cómo funciona, paquetes, países, CTA — no brand signup links
6. `/contacto` → submit → "Mensaje enviado"
7. Admin → `/admin` → the message appears; approve/reject creators
8. Ops → `/marca` → create a campaign → visible to creators immediately

Health: `GET /api/health` returns JSON; `/diagnostico` checks the browser → API chain.

## Commands

```bash
npm run build          # shared + api + web
npm run typecheck
npm run db:studio      # Prisma Studio
```

There is no automated test suite yet; verification is the checklist above.
