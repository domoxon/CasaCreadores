import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";

interface Application {
  name: string; email: string; country: string; languages: string[]; contact: string;
  platforms: Record<string, string>; followerCount: number; nichos: string[]; contentTypes: string[];
  payoutMethod: string; bestPosts: string; bio: string; referredBy: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED"; createdAt: string; reviewedAt: string | null; activatedAt: string | null;
}

const STATUS_LABEL = { PENDING: "Pendiente", APPROVED: "Aprobada", REJECTED: "Rechazada" } as const;

function linkFor(platform: string, value: string): string | null {
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "");
  const base: Record<string, string> = {
    X: "https://x.com/", Instagram: "https://instagram.com/", TikTok: "https://tiktok.com/@", Twitch: "https://twitch.tv/",
  };
  return base[platform] ? base[platform] + handle : null;
}

// Página a la que lleva el email "Nueva solicitud". Solo la cuenta ADMIN puede verla
// (si no hay sesión, pide iniciar sesión y vuelve aquí). Aprobar = POST (nunca GET).
export function ReviewApplication() {
  const { token } = useParams();
  const [app, setApp] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ status: string; inviteUrl?: string; emailSent: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetch<Application>(`/applications/review/${token}`)
      .then(setApp)
      .catch((err) => setError(toUserMessage(err, "No encontramos esta solicitud.")));
  }, [token]);

  async function decide(action: "approve" | "reject") {
    setBusy(true);
    setError(null);
    try {
      const r = await apiFetch<{ status: string; inviteUrl?: string; emailSent: boolean }>(`/applications/review/${token}`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      setResult(r);
      setApp((a) => (a ? { ...a, status: r.status as Application["status"] } : a));
    } catch (err) {
      setError(toUserMessage(err, "No se pudo guardar la decisión."));
    } finally {
      setBusy(false);
    }
  }

  if (error && !app) return <div className="container max-w-xl py-16 text-sm text-destructive">{error}</div>;
  if (!app) return <div className="container max-w-xl py-16 text-sm text-muted-foreground">Cargando solicitud…</div>;

  const rows: Array<[string, React.ReactNode]> = [
    ["Email", app.email],
    ["País", app.country],
    ["Idiomas", app.languages.join(", ")],
    ["WhatsApp / Telegram", app.contact],
    [
      "Redes",
      <div className="flex flex-col gap-1">
        {Object.entries(app.platforms).map(([p, v]) => {
          const href = linkFor(p, v);
          return (
            <span key={p}>
              {p}:{" "}
              {href ? (
                <a href={href} target="_blank" rel="noreferrer" className="font-medium text-foreground underline">
                  {v}
                </a>
              ) : (
                v
              )}
            </span>
          );
        })}
      </div>,
    ],
    ["Seguidores", app.followerCount.toLocaleString("es")],
    ["Nichos", app.nichos.join(", ")],
    ["Contenido", app.contentTypes.join(", ")],
    ["Cobro", app.payoutMethod],
    ["Mejores posts", app.bestPosts || "—"],
    ["Sobre su audiencia", app.bio || "—"],
    ["Recibida", new Date(app.createdAt).toLocaleString("es")],
  ];

  return (
    <div className="container max-w-2xl py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revisar solicitud</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{app.name}</h1>
        <Badge variant={app.status === "APPROVED" ? "success" : app.status === "REJECTED" ? "destructive" : "warning"}>
          {STATUS_LABEL[app.status]}
        </Badge>
      </div>

      <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr]">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="whitespace-pre-line break-words text-foreground">{v}</dd>
          </div>
        ))}
      </dl>

      {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

      {!app.activatedAt && !result && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => decide("approve")} disabled={busy}>
            {app.status === "APPROVED" ? "Reenviar aprobación" : "Aprobar"}
          </Button>
          {app.status !== "REJECTED" && (
            <Button variant="outline" onClick={() => decide("reject")} disabled={busy}>
              Rechazar
            </Button>
          )}
        </div>
      )}

      {app.activatedAt && <p className="mt-8 text-sm text-muted-foreground">Este creador ya activó su cuenta.</p>}

      {result?.status === "APPROVED" && (
        <div className="mt-8 rounded-lg border border-border p-5 text-sm">
          <p className="font-medium text-foreground">Aprobado.</p>
          <p className="mt-1 text-muted-foreground">
            {result.emailSent
              ? `Enviamos a ${app.email} el enlace para crear su cuenta.`
              : `No se pudo enviar el email a ${app.email}. Mándale este enlace por WhatsApp o Telegram:`}
          </p>
          {result.inviteUrl && (
            <div className="mt-3 flex gap-2">
              <Input readOnly value={result.inviteUrl} onFocus={(e) => e.target.select()} />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(result.inviteUrl!).then(() => setCopied(true));
                }}
              >
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
          )}
        </div>
      )}
      {result?.status === "REJECTED" && (
        <p className="mt-8 text-sm text-muted-foreground">
          Solicitud rechazada.{result.emailSent ? " Le avisamos por email." : ""}
        </p>
      )}
    </div>
  );
}
