# Checklist de lanzamiento — fin de semana

Todo el código de este repo está corregido y verificado en una réplica local completa
(Postgres + backend + frontend con el mismo rewrite de Vercel). Para que quede vivo en
internet faltan **dos pasos manuales** que requieren acceso a cuentas:

## Paso 1 — Vercel (cuenta de Dom, ~2 minutos)

1. https://vercel.com/new → **Import Git Repository** → `domoxon/Casa-Creadores`
   (si no aparece, conecta la cuenta de GitHub `domoxon` cuando lo pida).
2. **Root Directory:** `packages/frontend` (único ajuste necesario).
3. Deploy. La URL resultante es la web pública nueva.

`packages/frontend/vercel.json` ya enruta `/api/*` al backend de Railway server-side;
no hay que configurar variables de entorno.

> El intento de crearlo automáticamente devolvió 403: la integración de Vercel conectada
> a esta sesión no tiene permiso para crear proyectos en el equipo.

## Paso 2 — Railway (cuenta donde vive el backend, ~5 minutos) — **IMPRESCINDIBLE**

El servicio de Railway sigue ejecutando **el primer commit del proyecto** (`5571a9`).
Por eso hoy en producción:

- el formulario de contacto devuelve 404 (la ruta `/api/contact` no existía aún), y
- cada registro queda **bloqueado para siempre** pidiendo verificar un email que nunca
  llega (hay variables `SMTP_HOST`/`SMTP_USER` configuradas pero el envío de emails
  nunca se implementó — ya está corregido en este repo).

Cómo arreglarlo:

1. Railway → servicio backend → **Settings → Source**: apuntar al repo
   `domoxon/Casa-Creadores`, rama `main` (o dar acceso de push a este repo a quien
   administre Railway). Redeploy.
2. Variables necesarias: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
   `NODE_ENV=production`. Las `SMTP_*` se pueden borrar (el código nuevo las ignora).
3. Las migraciones corren solas al arrancar. Sembrar datos una vez:
   `railway run npm run db:seed --workspace=packages/backend`
4. **Cambiar las contraseñas demo** (`admin123`, `marca123`, `creador123`) tras el seed.

### Alternativa si no hay acceso a ese Railway

Crear un servicio nuevo en Railway/Render con este repo + un Postgres, y actualizar la
URL de destino en `packages/frontend/vercel.json` (línea del rewrite `/api/:path*`).

## Paso 3 — Verificación (2 minutos)

1. `https://<url-vercel>/diagnostico` → debe decir que la cadena completa está OK.
2. Registrar un creador de prueba → debe entrar directo al panel sin pedir email.
3. Enviar el formulario de contacto → debe aparecer "Mensaje enviado".
4. Entrar en `/admin` (cuenta admin) → debe verse el mensaje y el creador pendiente.

## Flujo operativo interno (sin login para marcas)

- Las marcas **no** tienen cuenta: llegan por `/contacto`; sus mensajes se leen en `/admin`.
- Las campañas las publica el equipo con la cuenta interna de rol MARCA en `/marca`
  (ruta sin enlaces públicos).
- Los creadores se aprueban en `/admin` (verificar/rechazar).
- Las reseñas de la landing (`packages/frontend/src/pages/Landing.tsx`, array
  `testimonials`) son **placeholders**: sustituir por citas reales de los pilotos antes
  de hacer marketing serio con la página.
