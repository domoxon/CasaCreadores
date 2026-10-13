// Punto de entrada de la API en Vercel.
//
// Toda petición a /api/* llega aquí (rewrite en vercel.json) y la atiende la app Express
// de apps/api, compilada a apps/api/dist durante el build (scripts/vercel-build.mjs).
// Express ve la URL original (/api/auth/register, etc.), así que las rutas no cambian.
// La integración de Neon en Vercel creó las variables con prefijo (STORAGECASA_DATABASE_URL, …).
// Se aceptan ambos nombres: si falta DATABASE_URL se toma la versión con prefijo.
for (const name of ["DATABASE_URL", "DATABASE_URL_UNPOOLED"]) {
  if (!process.env[name] && process.env[`STORAGECASA_${name}`]) {
    process.env[name] = process.env[`STORAGECASA_${name}`];
  }
}
if (!process.env.DATABASE_URL_UNPOOLED && process.env.DATABASE_URL) {
  process.env.DATABASE_URL_UNPOOLED = process.env.DATABASE_URL;
}

const { getMissingEnv } = require("../apps/api/dist/lib/env");

const missing = getMissingEnv();

if (missing.length > 0) {
  console.error(`[CONFIG] Faltan variables de entorno: ${missing.join(", ")}`);
  module.exports = (_req, res) => {
    res.statusCode = 503;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        status: "error",
        error: "API sin configurar",
        missing,
      })
    );
  };
} else {
  module.exports = require("../apps/api/dist/app").default;
}
