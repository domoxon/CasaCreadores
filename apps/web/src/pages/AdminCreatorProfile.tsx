import { ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { CAMPAIGN_STATUS_LABEL } from "@/lib/campaignOptions";
import { describePayout, PAYOUT_STATUS_LABEL, PayoutDetails } from "@/lib/payout";
import { toUserMessage } from "@/lib/errors";

interface Profile {
  id: string;
  email: string;
  joinedAt: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  followerCount: number;
  nichos: string[];
  bio: string;
  handles: Record<string, string | null>;
  payout: { method: string | null; details: PayoutDetails | null; updatedAt: string | null };
  application: {
    name: string; country: string; languages: string[]; contact: string; platforms: Record<string, string>;
    contentTypes: string[]; payoutMethod: string; bestPosts: string; bio: string; referredBy: string | null;
    createdAt: string; reviewedAt: string | null; reviewToken: string;
  } | null;
  campaigns: Array<{
    id: string; status: "PENDING" | "ACCEPTED" | "REJECTED"; appliedAt: string;
    payoutStatus: string; payoutAmount: number | null; paidAt: string | null;
    campaign: { id: string; title: string; brandName: string | null; status: string };
  }>;
}

const STATUS = { VERIFIED: ["Aprobado", "success"], PENDING: ["Pendiente", "warning"], REJECTED: ["Suspendido", "destructive"] } as const;
const APP_STATUS = { ACCEPTED: ["Seleccionado", "success"], PENDING: ["Pendiente", "warning"], REJECTED: ["No seleccionado", "destructive"] } as const;

function profileUrl(platform: string, value: string): string | null {
  if (/^https?:\/\//i.test(value)) return value;
  const h = value.replace(/^@/, "");
  const base: Record<string, string> = {
    X: "https://x.com/", Instagram: "https://instagram.com/", TikTok: "https://tiktok.com/@", Twitch: "https://twitch.tv/",
  };
  return base[platform] ? base[platform] + h : null;
}

const fmt = (d: string) => new Date(d).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });

// Ficha de un creador (solo ADMIN): todo lo que sabemos de él en una página.
export function AdminCreatorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setP(await apiFetch<Profile>(`/admin/creators/${id}/profile`));
    } catch (err) {
      setError(toUserMessage(err, "No pudimos cargar este creador."));
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function setStatus(status: "VERIFIED" | "REJECTED") {
    await apiFetch(`/admin/creators/${id}/verify`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  }

  if (error) return <div className="container max-w-3xl py-16 text-sm text-destructive">{error}</div>;
  if (!p) return <div className="container max-w-3xl py-16 text-sm text-muted-foreground">Cargando…</div>;

  const a = p.application;
  const socials: Record<string, string> = {};
  for (const [k, v] of Object.entries(p.handles)) if (v) socials[k] = v;
  for (const [k, v] of Object.entries(a?.platforms || {})) if (v) socials[k] = v;
  const title = a?.name || p.handles.X || p.handles.Instagram || p.email;
  const [statusLabel, statusVariant] = STATUS[p.status];

  const rows: Array<[string, React.ReactNode]> = [
    ["Email", <a href={`mailto:${p.email}`} className="underline">{p.email}</a>],
    ["WhatsApp / Telegram", a?.contact || "—"],
    ["País", a?.country || "—"],
    ["Idiomas", a?.languages.join(", ") || "—"],
    [
      "Redes",
      Object.keys(socials).length === 0 ? "—" : (
        <div className="flex flex-col gap-1">
          {Object.entries(socials).map(([k, v]) => {
            const href = profileUrl(k, v);
            return (
              <span key={k}>
                {k}:{" "}
                {href ? (
                  <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-foreground underline">
                    {v} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  v
                )}
              </span>
            );
          })}
        </div>
      ),
    ],
    ["Seguidores", p.followerCount.toLocaleString("es")],
    ["Nichos", p.nichos.join(", ") || "—"],
    ["Contenido", a?.contentTypes.join(", ") || "—"],
    [
      "Datos de cobro",
      p.payout.method ? (
        <div className="flex flex-col gap-0.5">
          {describePayout(p.payout.method, p.payout.details).map(([k, v]) => (
            <span key={k} className="break-all"><span className="text-muted-foreground">{k}:</span> {v}</span>
          ))}
        </div>
      ) : (
        `Sin cargar${a?.payoutMethod ? ` (en la solicitud eligió: ${a.payoutMethod})` : ""}`
      ),
    ],
    ["Mejores posts", a?.bestPosts || "—"],
    ["Bio", p.bio || a?.bio || "—"],
    ["Referido por", a?.referredBy || "—"],
    ["En la red desde", fmt(p.joinedAt)],
  ];

  return (
    <div className="container max-w-3xl py-12">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
        <div className="flex gap-2">
          {a && (
            <Button asChild variant="ghost" size="sm">
              <Link to={`/revisar/${a.reviewToken}`}>Ver solicitud</Link>
            </Button>
          )}
          {p.status === "VERIFIED" ? (
            <Button variant="outline" size="sm" onClick={() => setStatus("REJECTED")}>Suspender</Button>
          ) : (
            <Button size="sm" onClick={() => setStatus("VERIFIED")}>Aprobar</Button>
          )}
        </div>
      </div>

      <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr]">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="whitespace-pre-line break-words text-foreground">{v}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mb-3 mt-10 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Campañas ({p.campaigns.length})
      </h2>
      {p.campaigns.length === 0 ? (
        <p className="border-t border-border py-6 text-sm text-muted-foreground">Todavía no aplicó a ninguna campaña.</p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {p.campaigns.map((x) => {
            const [label, variant] = APP_STATUS[x.status];
            return (
              <div key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <Link to={`/admin/campanas/${x.campaign.id}`} className="font-medium text-foreground hover:underline">
                    {x.campaign.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {x.campaign.brandName || "—"} · aplicó el {fmt(x.appliedAt)} · campaña {CAMPAIGN_STATUS_LABEL[x.campaign.status]?.toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {x.status === "ACCEPTED" && (
                    <span className="text-xs text-muted-foreground">
                      {PAYOUT_STATUS_LABEL[x.payoutStatus]}{x.payoutAmount != null ? ` · $${x.payoutAmount}` : ""}
                    </span>
                  )}
                  <Badge variant={variant}>{label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
