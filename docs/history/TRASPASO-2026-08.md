# Traspaso — Casa Creadores: producción caída (registro, login, contacto)

Documento de traspaso a otra sesión de Claude **con permisos de escritura en GitHub**.
Todo lo necesario está aquí. La sesión anterior hizo la investigación y las correcciones,
pero **no pudo hacer push**: GitHub devolvía `403` (solo lectura).

---

## 1. Lo que hay que hacer (resumen ejecutivo)

1. Aplicar el commit **`5a98db0`** (adjunto como parche) sobre `main` (`0d44dbe`).
2. Push a `main` (o a `claude/production-audit-fixes-lzy1y0` y merge).
3. Esperar el deploy de Vercel.
4. **Verificar en producción real** — esto es lo que la sesión anterior NO pudo hacer.
5. Si sigue fallando, usar `/diagnostico` para saber si el problema es Vercel o Railway.

**Lo único que puede seguir roto y no se pudo comprobar: si el backend de Railway está vivo.**

---

## 2. Datos del proyecto

| Dato | Valor |
|---|---|
| Repo | `katamar-lang/CASA-CREADORES` |
| Rama base | `main` @ `0d44dbe` |
| Commit a aplicar | `5a98db0` |
| Rama de trabajo previa | `claude/production-audit-fixes-lzy1y0` |
| Frontend (Vercel) | `https://casa-creadores-frontend.vercel.app` |
| Backend (Railway) | `https://casa-creadores-production.up.railway.app` |
| Perfil X (único que existe) | `https://x.com/casadecrear` |
| Stack | monorepo npm workspaces: React+Vite / Express+Prisma / PostgreSQL |
| Root Directory en Vercel | debe ser `packages/frontend` |

---

## 3. Historia del fallo (dos rondas, dos causas distintas)

### Ronda 1 — causa raíz original (ya corregida, en `0d44dbe`)

El bundle de producción se construyó **sin `VITE_API_URL`**, así que quedó embebida la URL
de desarrollo `http://localhost:4000/api`. En una página HTTPS eso falla siempre (mixed
content + no hay nada escuchando en el equipo del visitante). `fetch` rechaza → `NetworkError`
→ *"No pudimos conectar con el servidor"*. La landing funcionaba porque no llama a la API.

Se verificó extrayendo la URL del bundle compilado.

### Ronda 2 — por qué `0d44dbe` NO arregló producción (lo corrige `5a98db0`)

`0d44dbe` añadió una **función serverless** `packages/frontend/api/[...path].ts` para
reenviar `/api/*` a Railway. **Esa función nunca llegó a servirse.** Como el rewrite a
`index.html` excluye `/api` a propósito, las peticiones caían en el 404 de Vercel.

Reproducido con el build exacto de `0d44dbe`:

```
MENSAJE EN PANTALLA: "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo."

Peticiones del navegador:
  · POST /api/auth/register                                     -> 404, text/html
  · POST https://casa-creadores-production.up.railway.app/...   -> TypeError: Failed to fetch

Consola:
  · [API] /api/auth/register no devolvió JSON (content-type "text/html"). Cambiando a Railway.
  · [API] Fallo de red: TypeError: Failed to fetch
```

**Segundo error, propio de la ronda 1:** el reintento automático cross-origin contra Railway
que se añadió como "red de seguridad" convertía ese `404` —perfectamente diagnosticable— en
un `NetworkError` opaco. Por eso el usuario volvía a ver el mismo mensaje inútil. Empeoraba
el diagnóstico en lugar de mejorarlo.

---

## 4. Qué hace el commit `5a98db0`

**El cambio esencial son 4 líneas en `packages/frontend/vercel.json`:** `/api/*` pasa a ser un
**rewrite de configuración** en vez de una función serverless.

Contenido final completo del fichero:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://casa-creadores-production.up.railway.app/api/:path*"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

**El orden importa**: `/api/*` va primero; el segundo rewrite manda el resto a `index.html`
para React Router y excluye `/api` con el lookahead negativo.

Por qué un rewrite y no una función:
- No depende de que Vercel detecte y construya un directorio `api/`.
- No hay runtime de Node que pueda fallar.
- No hay nada que desplegar aparte del propio JSON.
- El reenvío es **server-side**: el navegador nunca sale del origen, así que **CORS deja de
  intervenir por completo** (la política CORS del backend ya no puede tumbar la web).

Resto de cambios del commit (8 ficheros, +227/−276):

| Fichero | Cambio |
|---|---|
| `packages/frontend/vercel.json` | el rewrite de `/api/*` (**el fix**) |
| `packages/frontend/api/[...path].ts` | **eliminado** (era la pieza rota; además habría tenido precedencia sobre el rewrite) |
| `packages/frontend/src/lib/api.ts` | eliminado el reintento cross-origin; toda respuesta no-JSON se reporta con su código y content-type reales |
| `packages/frontend/src/lib/errors.ts` | un `404` ya no dice "revisa tu conexión" sino que la API no está enrutada |
| `packages/frontend/src/lib/apiUrl.ts` | eliminada la constante de Railway (ya no vive en el bundle) |
| `packages/frontend/src/pages/Diagnostics.tsx` | `/diagnostico` hace la petición en crudo y nombra el eslabón roto |
| `README.md`, `.env.example` | documentación de la arquitectura nueva |

---

## 5. Cómo aplicar

Con el parche adjunto (`casa-creadores-5a98db0.patch`), verificado que aplica limpio sobre `0d44dbe`:

```bash
git fetch origin main
git checkout -B claude/production-audit-fixes-lzy1y0 origin/main
git am < casa-creadores-5a98db0.patch
git push -u origin claude/production-audit-fixes-lzy1y0
```

**Si el parche no está disponible**, el fix mínimo imprescindible es reemplazar
`packages/frontend/vercel.json` por el JSON de la sección 4 y borrar
`packages/frontend/api/[...path].ts`. Eso solo ya arregla producción; el resto del commit
mejora el diagnóstico y los mensajes de error.

---

## 6. Verificación en producción (LO IMPORTANTE — no se pudo hacer antes)

La sesión anterior tenía **bloqueado el egreso de red**: todo dominio externo devolvía
`403 Host not in allowlist`, incluidos `*.vercel.app` y `*.up.railway.app`. Por eso ninguna
prueba se hizo contra producción real. **Esto es lo primero que la nueva sesión debe hacer.**

```bash
# 1. ¿El backend de Railway está vivo? (LA GRAN INCÓGNITA)
curl -i https://casa-creadores-production.up.railway.app/api/health
#    Esperado: 200 + {"status":"ok","service":"casa-creadores-backend",...}

# 2. ¿Vercel enruta /api hacia Railway?
curl -i https://casa-creadores-frontend.vercel.app/api/health
#    Esperado: 200 + el mismo JSON
#    404 + text/html  -> el rewrite no se aplica (ver sección 7)
#    502/503/504      -> enruta bien, pero Railway no responde

# 3. Registro real
curl -i -X POST https://casa-creadores-frontend.vercel.app/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"prueba'"$RANDOM"'@test.dev","password":"password123","role":"CREADOR"}'
#    Esperado: 201 + accessToken + refreshToken

# 4. Login (usuario demo del seed)
curl -i -X POST https://casa-creadores-frontend.vercel.app/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@casacreadores.com","password":"admin123"}'

# 5. Contacto
curl -i -X POST https://casa-creadores-frontend.vercel.app/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Prueba","email":"p@test.dev","message":"Mensaje de verificacion de produccion."}'
```

Y en navegador (Playwright + Chromium en `/opt/pw-browsers/`): registro creador, registro
marca, login, persistencia tras recarga, logout y contacto sobre el dominio real.

**Página de diagnóstico:** `https://casa-creadores-frontend.vercel.app/diagnostico`
distingue los tres casos automáticamente:

| `/api/health` devuelve | Veredicto |
|---|---|
| `404` + `text/html` | Vercel no enruta `/api/*` → fallo de despliegue del frontend |
| `502`/`503`/`504` | Vercel enruta bien, pero Railway no responde |
| `200` + JSON | cadena completa correcta |

---

## 7. Si sigue fallando: qué mirar

### Caso A — `/api/health` da 404
`vercel.json` no se está leyendo. **Vercel → proyecto → Settings → General → Root Directory**
debe valer `packages/frontend`. Si estuviera en la raíz del repo, Vercel ignora
`packages/frontend/vercel.json` y ningún rewrite se aplica.

### Caso B — `/api/health` da 502/503/504
El fallo es de Railway. **Railway → servicio backend → Deployments (logs)** y **Variables**.
Variables **obligatorias** (sin ellas el proceso ahora se niega a arrancar y lo dice en el log):

- `DATABASE_URL` (referencia al plugin de Postgres)
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `NODE_ENV=production`

`FRONTEND_URL` es **opcional** desde `0d44dbe`: CORS acepta cualquier `*.vercel.app` y
localhost. Con el rewrite de `5a98db0` CORS ya ni siquiera interviene. Solo hace falta para
los enlaces de verificación por email.

**Comprobar también que Railway se haya redesplegado con `0d44dbe`.** Si sigue con el código
de `23c5d35`, arranca sin validación de entorno y con el CORS antiguo. Con el rewrite eso ya
no rompe la web, pero conviene que esté al día.

### Caso C — migraciones
`railway.json` ejecuta `prisma migrate deploy` en cada arranque (parte del `startCommand`).
Si la base está vacía, sembrar una vez:
`railway run npm run db:seed --workspace=packages/backend`

---

## 8. Estado de cada punto

| Flujo | Estado |
|---|---|
| Registro Creador | ✅ corregido y probado en réplica local |
| Registro Marca | ✅ ídem |
| Login | ✅ ídem (+ 401 correcto con credenciales malas) |
| Persistencia de sesión | ✅ sobrevive a recarga, tokens en localStorage |
| Logout | ✅ limpia tokens e invalida el refresh en servidor |
| Contacto | ✅ guardado en BD |
| Redes sociales | ✅ X visible en el footer; LinkedIn/Instagram no existen y por eso no se renderizan |
| Eliminación de Hivello | ✅ cero coincidencias en código y build |
| Vercel → Railway | ✅ vía rewrite server-side |
| CORS | ✅ deja de intervenir (mismo origen) |
| BD / migraciones | ✅ `migrate deploy` automático; verificado local |
| Manejo de errores | ✅ red / no-JSON / 404 / 429 / 5xx / validación diferenciados |
| **Salud real de Railway** | ❓ **NO VERIFICADO — egreso bloqueado** |
| **Producción real** | ❓ **NO VERIFICADO — egreso bloqueado** |

---

## 9. Cómo se probó (reproducible por la nueva sesión)

Sin acceso a producción, se montó una réplica fiel:

- **PostgreSQL 16 real** en `127.0.0.1:5433` (binarios en `/usr/lib/postgresql/16/bin`, hay
  que ejecutar `initdb`/`pg_ctl` como usuario `postgres`; Docker no está disponible).
  Migraciones con `prisma migrate deploy` + `prisma db seed`.
- **Backend** compilado igual que Railway y arrancado con `node dist/index.js`.
- **Simulador de Vercel**: servidor que lee `packages/frontend/vercel.json` y aplica el mismo
  orden de resolución que Vercel — 1) ficheros estáticos, 2) rewrites en orden, reenviando
  server-side los destinos absolutos. Permite redirigir el destino de Railway a un backend
  local para probar la cadena completa.
- **Alias de host** en `/etc/hosts` (`casa-creadores.test`) para que el frontend no se
  considerara "local" y resolviera la API igual que en producción.
- **Navegador real**: Chromium en `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
  (usar `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`; no ejecutar `playwright install`).

Se verificaron además los tres veredictos de `/diagnostico`, incluido el de Railway caído.

**Credenciales demo del seed:** `admin@casacreadores.com` / `admin123`,
`marca@casacreadores.demo` / `marca123`, `creador1@casacreadores.demo` / `creador123`.

---

## 10. Aviso sobre un bug ya corregido (no reintroducir)

En `Diagnostics.tsx`, la comprobación de `502/503/504` **debe ir antes** que la del
`content-type`. Vercel devuelve HTML en sus páginas de error, así que si se mira el
content-type primero, un backend caído se diagnostica como problema de enrutado — justo la
pista equivocada. Ya está en el orden correcto; conviene no invertirlo.

Tampoco reintroducir el reintento automático cross-origin contra Railway desde el cliente:
es lo que enmascaraba la causa real como error de red.
