# Casa Creadores

Red de creadores UGC de LATAM para marcas de cripto, fintech y tech.
Web pública + cuentas de creadores + panel interno, todo en un solo proyecto de Vercel.

**Producción:** https://casacreadores.vercel.app · **Diagnóstico:** `/diagnostico`

## Estructura

```
apps/web/          Frontend — React 18 + Vite + Tailwind + shadcn/ui (UI en español)
apps/api/          API — Express + Prisma + PostgreSQL
packages/shared/   Tipos TypeScript compartidos
api/index.js       Entrada de la API en Vercel (envuelve apps/api)
scripts/           Build de Vercel (migraciones + cuentas internas en producción)
docs/strategy/     Documentos de negocio 01–11 (modelo, mercado, creadores, marcas…)
docs/history/      Notas de traspasos y lanzamientos anteriores
brand/             Logo, banner y imagen social
legacy/nextjs-v1/  Primera versión (Next.js, solo diseño). Archivada, no se despliega.
```

## Cómo funciona en producción

```
navegador ──► Vercel ──► apps/web/dist           (estático)
                   └──► /api/*  ─► api/index.js ─► Express ─► Neon Postgres
```

- Mismo origen: la web llama a `/api/...` y Vercel lo envía a la función. Sin CORS, sin otro servidor.
- `npm run vercel-build` (ver `scripts/vercel-build.mjs`): compila todo y, **solo en producción**,
  aplica las migraciones de Prisma y crea las cuentas internas (`ADMIN_*`, `OPS_*`) si no existen.
- Push a `main` → deploy de producción automático. Ramas → previews (sin migraciones).

Variables en Vercel: `DATABASE_URL` + `DATABASE_URL_UNPOOLED` (las pone Neon),
`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_EMAIL/PASSWORD`, `OPS_EMAIL/PASSWORD`.

## Flujos

- **Creadores:** `/registro` → perfil → ven campañas activas → aplican. Se aprueban en `/admin`.
- **Marcas:** no tienen cuenta. Escriben por `/contacto`; los mensajes se leen en `/admin`.
- **Equipo:** `/admin` (cuenta ADMIN) y `/marca` (cuenta interna MARCA, publica campañas; sin enlaces públicos).

## Desarrollo local

```bash
npm install
docker compose up -d                 # Postgres en localhost:5432
cp .env.example .env                 # y rellena los JWT_*
npm run db:migrate && npm run db:seed
npm run dev                          # API :4000 + web :5173
```

Cuentas demo del seed (solo local): `admin@casacreadores.com / admin123`,
`marca@casacreadores.demo / marca123`, `creador1@casacreadores.demo / creador123`.

Más detalle para agentes de IA y reglas que no se deben romper: [AGENTS.md](AGENTS.md).
