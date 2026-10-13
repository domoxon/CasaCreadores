// Punto de entrada de la API en Vercel.
//
// Toda petición a /api/* llega aquí (rewrite en vercel.json) y la atiende la app Express
// de apps/api, compilada a apps/api/dist durante el build (scripts/vercel-build.mjs).
// Express ve la URL original (/api/auth/register, etc.), así que las rutas no cambian.
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
