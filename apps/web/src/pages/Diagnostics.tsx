import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL_INFO, getActiveApiUrl } from "@/lib/api";
import { getSocialLinks } from "@/lib/site";

// Página de diagnóstico: responde "¿dónde se rompe la cadena?" sin abrir las
// herramientas de desarrollo.
//
// Hace la petición con `fetch` en crudo, no con `apiFetch`, precisamente porque
// necesita ver lo que `apiFetch` esconde: el código HTTP, el content-type y el
// principio del cuerpo. Esos tres datos distinguen los tres fallos posibles:
//
//   · 404 + text/html  -> Vercel no enruta /api/* hacia la función (fallo de deploy)
//   · 502/503/504      -> Vercel enruta bien, pero la API no responde
//   · 200 + JSON       -> la cadena completa funciona
//
// La cadena es: navegador -> Vercel (/api/*) -> función api/index.js -> PostgreSQL (Neon).

type Probe =
  | { state: "loading" }
  | {
      state: "done";
      ok: boolean;
      status: number;
      contentType: string;
      ms: number;
      bodyPreview: string;
      parsed: Record<string, unknown> | null;
    }
  | { state: "rejected"; message: string; ms: number };

function Row({ label, value, tone }: { label: string; value: string; tone?: "ok" | "bad" }) {
  const color = tone === "ok" ? "text-emerald-600" : tone === "bad" ? "text-destructive" : "text-foreground";
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="w-56 shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className={`break-all font-mono text-sm ${color}`}>{value}</span>
    </div>
  );
}

/** Traduce la respuesta cruda al eslabón concreto que está fallando. */
function diagnose(probe: Probe): { title: string; detail: string; tone: "ok" | "bad" } {
  if (probe.state === "loading") return { title: "Comprobando...", detail: "", tone: "ok" };

  if (probe.state === "rejected") {
    return {
      title: "La petición no llegó a salir",
      detail:
        "El navegador rechazó la conexión (red, DNS o CORS). Si la web ha cargado, " +
        "lo normal es que la URL de la API apunte fuera de este dominio.",
      tone: "bad",
    };
  }

  if (probe.status === 404) {
    return {
      title: "Vercel no está enrutando /api hacia la función de la API",
      detail:
        "La ruta /api/* devuelve 404 desde el propio dominio, así que el rewrite de vercel.json " +
        "no se está aplicando o la función api/index.js no se desplegó. Revisa el build en Vercel.",
      tone: "bad",
    };
  }

  // Este caso va antes que la comprobación de content-type: cuando el backend
  // no responde, Vercel devuelve su propia página de error, que es HTML. Si se
  // mirara el content-type primero, un backend caído se diagnosticaría como un
  // problema de enrutado, que es justo la pista equivocada.
  if (probe.status === 502 || probe.status === 503 || probe.status === 504) {
    return {
      title: "Vercel enruta bien, pero la API no responde",
      detail:
        `El reenvío funciona (HTTP ${probe.status} del gateway) y el error viene del backend: el servicio ` +
        "no arranca, le faltan variables de entorno (DATABASE_URL, JWT_*) o no llega a la base de datos. Revisa los logs de la función en Vercel.",
      tone: "bad",
    };
  }

  if (!probe.contentType.includes("application/json")) {
    return {
      title: "Responde algo que no es el backend",
      detail: `Se recibió content-type "${probe.contentType || "desconocido"}". Suele ser el index.html de la SPA, señal de que /api/* no está enrutado.`,
      tone: "bad",
    };
  }

  if (probe.ok) {
    return {
      title: "Cadena completa funcionando",
      detail: "El navegador llega a Vercel y la función de la API responde con JSON válido.",
      tone: "ok",
    };
  }

  return { title: `El backend respondió HTTP ${probe.status}`, detail: probe.bodyPreview, tone: "bad" };
}

export function Diagnostics() {
  const [probe, setProbe] = useState<Probe>({ state: "loading" });
  const socialLinks = getSocialLinks();
  const healthUrl = `${getActiveApiUrl()}/health`;

  useEffect(() => {
    const startedAt = performance.now();
    fetch(healthUrl, { headers: { Accept: "application/json" } })
      .then(async (res) => {
        const text = await res.text();
        let parsed: Record<string, unknown> | null = null;
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = null;
        }
        setProbe({
          state: "done",
          ok: res.ok,
          status: res.status,
          contentType: res.headers.get("content-type") || "",
          ms: Math.round(performance.now() - startedAt),
          bodyPreview: text.slice(0, 300),
          parsed,
        });
      })
      .catch((err) => {
        setProbe({
          state: "rejected",
          message: String(err),
          ms: Math.round(performance.now() - startedAt),
        });
      });
  }, [healthUrl]);

  const verdict = diagnose(probe);

  return (
    <div className="container max-w-2xl py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Diagnóstico</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Cadena completa: navegador → Vercel <code>/api/*</code> → función de la API → PostgreSQL (Neon).
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className={`text-base ${verdict.tone === "bad" ? "text-destructive" : ""}`}>
            {verdict.title}
          </CardTitle>
          <CardDescription>{verdict.detail}</CardDescription>
        </CardHeader>
        <CardContent>
          <Row label="URL consultada" value={healthUrl} />
          <Row label="Origen de la configuración" value={API_URL_INFO.source} />
          <Row label="Origen de la web" value={window.location.origin} />
          {probe.state === "done" && (
            <>
              <Row
                label="Código HTTP"
                value={String(probe.status)}
                tone={probe.ok ? "ok" : "bad"}
              />
              <Row label="Content-Type" value={probe.contentType || "—"} />
              <Row label="Tiempo de respuesta" value={`${probe.ms} ms`} />
              {probe.parsed && (
                <>
                  <Row label="Servicio" value={String(probe.parsed.service ?? "—")} />
                  <Row label="Estado" value={String(probe.parsed.status ?? "—")} />
                  <Row label="Verificación por email" value={String(probe.parsed.emailDelivery ?? "—")} />
                  <Row
                    label="Orígenes CORS permitidos"
                    value={
                      Array.isArray(probe.parsed.allowedOrigins)
                        ? (probe.parsed.allowedOrigins as string[]).join(", ")
                        : "—"
                    }
                  />
                </>
              )}
              {!probe.parsed && <Row label="Cuerpo recibido" value={probe.bodyPreview || "(vacío)"} />}
            </>
          )}
          {probe.state === "rejected" && <Row label="Error" value={probe.message} tone="bad" />}
          {API_URL_INFO.warnings.map((warning) => (
            <p key={warning} className="pt-3 text-sm text-destructive">
              {warning}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Redes sociales</CardTitle>
          <CardDescription>
            {socialLinks.length > 0
              ? "Enlaces activos en el pie de página."
              : "Sin configurar: el pie de página no muestra iconos."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {socialLinks.map(({ id, label, url }) => (
            <Row key={id} label={label} value={url} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
