import type { Campaign, CampaignApplication, Creator } from "@casa-creadores/shared";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CreatorWorkPanel } from "@/components/CreatorWorkPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { toUserMessage } from "../lib/errors";

type CampaignWithBrand = Campaign & { brand: { companyName: string; industry: string; website: string } };
type ApplicationWithCreator = CampaignApplication & { creator: Creator & { user: { email: string } } };

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "destructive",
};

export function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<CampaignWithBrand | null>(null);
  const [applications, setApplications] = useState<ApplicationWithCreator[]>([]);
  const [myApplication, setMyApplication] = useState<CampaignApplication | null>(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function load() {
    if (!id) return;
    setLoadError(null);
    try {
      const c = await apiFetch<CampaignWithBrand>(`/campaigns/${id}`);
      setCampaign(c);

      if (user?.role === "MARCA") {
        try {
          const apps = await apiFetch<ApplicationWithCreator[]>(`/campaigns/${id}/applications`);
          setApplications(apps);
        } catch {
          // La campaña puede pertenecer a otra marca: no es un error de pantalla.
          setApplications([]);
        }
      }

      if (user?.role === "CREADOR") {
        const myApps = await apiFetch<Array<CampaignApplication & { campaignId: string }>>(
          "/campaigns/mine/applications"
        );
        setMyApplication(myApps.find((a) => a.campaignId === id) || null);
      }
    } catch (err) {
      setLoadError(toUserMessage(err, "No pudimos cargar esta campaña."));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  async function handleApply() {
    if (!id) return;
    setApplying(true);
    setError(null);
    try {
      const app = await apiFetch<CampaignApplication>(`/campaigns/${id}/apply`, { method: "POST" });
      setMyApplication(app);
    } catch (err) {
      setError(toUserMessage(err, "No se pudo aplicar a la campaña."));
    } finally {
      setApplying(false);
    }
  }

  async function handleDecision(appId: string, status: "ACCEPTED" | "REJECTED") {
    if (!id) return;
    await apiFetch(`/campaigns/${id}/applications/${appId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (loadError) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-sm text-destructive">{loadError}</p>
        <Button variant="outline" size="sm" onClick={load}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!campaign) {
    return <div className="container py-24 text-center text-sm text-muted-foreground">Cargando...</div>;
  }

  const brandName = campaign.brandName || campaign.brand.companyName;
  const socials = Object.entries(campaign.socialLinks || {}).filter(([, v]) => v);
  const SOCIAL_LABEL: Record<string, string> = {
    website: "Web", x: "X", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", linkedin: "LinkedIn", telegram: "Telegram", discord: "Discord",
  };
  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" }) : null);
  const facts: Array<[string, string]> = [
    ...(campaign.paymentPerCreator != null ? ([["Pago por creador", `$${campaign.paymentPerCreator.toLocaleString("es")} USDC`]] as Array<[string, string]>) : []),
    ...(campaign.spots != null ? ([["Plazas", String(campaign.spots)]] as Array<[string, string]>) : []),
    ["Duración", `${campaign.duration} días`],
    ...(campaign.startDate ? ([["Fechas", `${fmtDate(campaign.startDate)}${campaign.endDate ? ` – ${fmtDate(campaign.endDate)}` : ""}`]] as Array<[string, string]>) : []),
    ["Mín. seguidores", campaign.minFollowers.toLocaleString("es")],
  ];
  const tags: Array<[string, string[] | undefined]> = [
    ["Plataformas", campaign.platforms],
    ["Países", campaign.countries],
    ["Nichos", campaign.nichos],
  ];

  return (
    <div className="container max-w-3xl py-12">
      {campaign.coverImageUrl && (
        <img src={campaign.coverImageUrl} alt="" className="mb-8 aspect-[16/9] w-full rounded-xl border border-border object-cover" />
      )}
      <div className="mb-6 flex items-center gap-3">
        {campaign.brandLogoUrl && (
          <img src={campaign.brandLogoUrl} alt="" className="h-12 w-12 rounded-lg border border-border object-cover" />
        )}
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {campaign.brandWebsite ? (
              <a href={campaign.brandWebsite} target="_blank" rel="noreferrer" className="hover:underline">{brandName}</a>
            ) : (
              brandName
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{campaign.title}</h1>
            {campaign.status !== "ACTIVE" && <Badge variant="secondary">{campaign.status === "PAUSED" ? "Pausada" : campaign.status === "COMPLETED" ? "Finalizada" : "Borrador"}</Badge>}
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6 border-y border-border py-5 sm:grid-cols-3">
        {facts.map(([k, v]) => (
          <div key={k}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
            <p className="mt-1 font-medium text-foreground">{v}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">La campaña</h2>
      <p className="mb-8 whitespace-pre-line leading-relaxed text-foreground">{campaign.description}</p>

      {campaign.deliverables && (
        <>
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">Entregables</h2>
          <p className="mb-8 whitespace-pre-line leading-relaxed text-foreground">{campaign.deliverables}</p>
        </>
      )}
      {campaign.requirements && (
        <>
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">Requisitos</h2>
          <p className="mb-8 whitespace-pre-line leading-relaxed text-foreground">{campaign.requirements}</p>
        </>
      )}
      {campaign.brandContext && (
        <>
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">Sobre {brandName}</h2>
          <p className="mb-6 whitespace-pre-line leading-relaxed text-foreground">{campaign.brandContext}</p>
        </>
      )}
      {socials.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {socials.map(([k, v]) => (
            <a key={k} href={v} target="_blank" rel="noreferrer" className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-foreground/50">
              {SOCIAL_LABEL[k] || k}
            </a>
          ))}
        </div>
      )}
      {tags.some(([, v]) => v && v.length > 0) && (
        <div className="mb-10 flex flex-col gap-3">
          {tags.filter(([, v]) => v && v.length > 0).map(([k, v]) => (
            <div key={k} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="w-24 text-muted-foreground">{k}</span>
              {v!.map((x) => (
                <Badge key={x} variant="outline">{x}</Badge>
              ))}
            </div>
          ))}
        </div>
      )}

      {user?.role === "CREADOR" && (
        <div className="mb-12">
          {myApplication ? (
            <Badge variant={STATUS_VARIANT[myApplication.status]}>
              {myApplication.status === "ACCEPTED" ? "¡Fuiste seleccionado!" : myApplication.status === "REJECTED" ? "No seleccionado esta vez" : "Ya aplicaste · en revisión"}
            </Badge>
          ) : (
            <Button onClick={handleApply} disabled={applying || campaign.status !== "ACTIVE"}>
              {applying ? "Aplicando..." : "Aplicar a esta campaña"}
            </Button>
          )}
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>
      )}

      {user?.role === "CREADOR" && myApplication?.status === "ACCEPTED" && id && <CreatorWorkPanel campaignId={id} />}

      {user?.role === "MARCA" && (
        <div>
          <h2 className="mb-6 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Aplicaciones ({applications.length})
          </h2>
          {applications.length === 0 ? (
            <p className="border-t border-border py-8 text-sm text-muted-foreground">Aún no hay creadores aplicando.</p>
          ) : (
            <div className="border-t border-border">
              {applications.map((a) => (
                <div key={a.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3 py-5">
                    <div>
                      <p className="font-medium text-foreground">{a.creator.xHandle || a.creator.igHandle || a.creator.user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.creator.followerCount.toLocaleString()} seguidores · {a.creator.nichos.join(", ")}
                      </p>
                      <Badge variant={STATUS_VARIANT[a.status]} className="mt-2">
                        {a.status}
                      </Badge>
                    </div>
                    {a.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleDecision(a.id, "ACCEPTED")}>
                          Aceptar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDecision(a.id, "REJECTED")}>
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
