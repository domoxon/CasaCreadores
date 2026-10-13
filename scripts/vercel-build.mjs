// Build de Vercel (se ejecuta desde la raíz del repo: "npm run vercel-build").
//
// 1. Tipos compartidos  2. API (tsc -> apps/api/dist, que importa api/index.js)
// 3. Solo en PRODUCCIÓN: migraciones de la base de datos + cuentas internas
// 4. Frontend (vite -> apps/web/dist, que Vercel sirve como estático)
//
// Las migraciones solo corren en producción para que un preview nunca altere la base real.
import { execSync } from "node:child_process";

const run = (cmd) => {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

const isProduction = process.env.VERCEL_ENV === "production";

run("npm run build -w packages/shared");
run("npx -w apps/api prisma generate");
run("npm run build -w apps/api");

if (isProduction) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definida en producción: conecta la base de datos (Neon) al proyecto.");
  }
  if (!process.env.DATABASE_URL_UNPOOLED) process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;
  run("npm run db:deploy -w apps/api");
  run("npm run db:bootstrap -w apps/api");
} else {
  console.log(`\n(VERCEL_ENV=${process.env.VERCEL_ENV ?? "local"}: se omiten migraciones)`);
}

run("npm run build -w apps/web");
