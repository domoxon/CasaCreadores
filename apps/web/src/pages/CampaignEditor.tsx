import type { Campaign } from "@casa-creadores/shared";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Chips } from "@/components/Chips";
import { ImageUpload } from "@/components/ImageUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { CAMPAIGN_COUNTRIES, CAMPAIGN_PLATFORMS, CAMPAIGN_STATUS_LABEL, SOCIAL_FIELDS } from "@/lib/campaignOptions";
import { NICHOS } from "@/lib/applicationOptions";
import { toUserMessage } from "@/lib/errors";

type Applicant = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  appliedAt: string;
  creator: { xHandle: string | null; igHandle: string | null; followerCount: number; nichos: string[]; user: { email: string } };
  profile: { name: string; country: string; contact: string } | null;
};

const EMPTY = {
  title: "", description: "", brandName: "", brandWebsite: "", brandLogoUrl: "", coverImageUrl: "",
  brandContext: "", deliverables: "", requirements: "", socialLinks: {} as Record<string, string>,
  platforms: [] as string[], countries: [] as string[], nichos: [] as string[],
  budgetUSDC: "", paymentPerCreator: "", spots: "", duration: "14", minFollowers: "0", startDate: "", endDate: "",
};
type Form = typeof EMPTY;

const dateInput = (v?: string | null) => (v ? v.slice(0, 10) : "");

function fromCampaign(c: Campaign): Form {
  return {
    title: c.title, description: c.description, brandName: c.brandName || "", brandWebsite: c.brandWebsite || "",
    brandLogoUrl: c.brandLogoUrl || "", coverImageUrl: c.coverImageUrl || "", brandContext: c.brandContext || "",
    deliverables: c.deliverables || "", requirements: c.requirements || "", socialLinks: c.socialLinks || {},
    platforms: c.platforms || [], countries: c.countries || [], nichos: c.nichos || [],
    budgetUSDC: String(c.budgetUSDC ?? ""), paymentPerCreator: c.paymentPerCreator != null ? String(c.paymentPerCreator) : "",
    spots: c.spots != null ? String(c.spots) : "", duration: String(c.duration ?? ""), minFollowers: String(c.minFollowers ?? 0),
    startDate: dateInput(c.startDate), endDate: dateInput(c.endDate),
  };
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-border py-8 lg:grid-cols-[220px_1fr]">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {hint && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Field({ id, label, children, hint }: { id?: string; label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// Crear / editar una campaña (solo ADMIN). Se guarda como borrador y se publica con un botón.
export function CampaignEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(EMPTY);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function load() {
    if (!id) return;
    try {
      const c = await apiFetch<Campaign>(`/admin/campaigns/${id}`);
      setCampaign(c);
      setForm(fromCampaign(c));
      setApplicants(await apiFetch<Applicant[]>(`/admin/campaigns/${id}/applications`));
    } catch (err) {
      setError(toUserMessage(err, "No pudimos cargar la campaña."));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function payload() {
    const num = (v: string) => (v.trim() === "" ? null : Number(v));
    return {
      ...form,
      socialLinks: Object.fromEntries(Object.entries(form.socialLinks).filter(([, v]) => v.trim())),
      budgetUSDC: Number(form.budgetUSDC || 0),
      paymentPerCreator: num(form.paymentPerCreator),
      spots: num(form.spots),
      duration: Number(form.duration || 0),
      minFollowers: Number(form.minFollowers || 0),
    };
  }

  async function save(publish: boolean, e?: FormEvent) {
    e?.preventDefault();
    setError(null);
    setNotice(null);
    setSaving(true);
    try {
      const saved = id
        ? await apiFetch<Campaign>(`/admin/campaigns/${id}`, { method: "PUT", body: JSON.stringify(payload()) })
        : await apiFetch<Campaign>("/admin/campaigns", { method: "POST", body: JSON.stringify(payload()) });
      let final = saved;
      if (publish) {
        final = await apiFetch<Campaign>(`/admin/campaigns/${saved.id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "ACTIVE" }),
        });
      }
      setCampaign(final);
      setNotice(publish ? "Campaña publicada: ya la ven los creadores aprobados." : "Cambios guardados.");
      if (!id) navigate(`/admin/campanas/${saved.id}`, { replace: true });
    } catch (err) {
      setError(toUserMessage(err, "No se pudo guardar la campaña."));
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(status: "DRAFT" | "PAUSED" | "COMPLETED" | "ACTIVE") {
    if (!id) return;
    setError(null);
    try {
      const c = await apiFetch<Campaign>(`/admin/campaigns/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setCampaign(c);
      setNotice(`Estado: ${CAMPAIGN_STATUS_LABEL[c.status]}.`);
    } catch (err) {
      setError(toUserMessage(err, "No se pudo cambiar el estado."));
    }
  }

  async function decide(appId: string, status: "ACCEPTED" | "REJECTED") {
    await apiFetch(`/admin/campaigns/${id}/applications/${appId}`, { method: "PATCH", body: JSON.stringify({ status }) });
    setApplicants(await apiFetch<Applicant[]>(`/admin/campaigns/${id}/applications`));
  }

  if (loading) return <div className="container py-16 text-sm text-muted-foreground">Cargando…</div>;

  const status = campaign?.status;

  return (
    <div className="container max-w-5xl py-12">
      <Link to="/admin?tab=campanas" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Campañas
      </Link>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{id ? form.title || "Campaña" : "Nueva campaña"}</h1>
          {status && (
            <Badge variant={status === "ACTIVE" ? "success" : status === "PAUSED" ? "warning" : "secondary"}>
              {CAMPAIGN_STATUS_LABEL[status]}
            </Badge>
          )}
        </div>
        {id && (
          <Button asChild variant="outline" size="sm">
            <Link to={`/campanas/${id}`}>
              Ver como creador <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>

      <form onSubmit={(e) => save(false, e)}>
        <Section title="Marca" hint="La empresa cliente. Es lo que verán los creadores.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="brandName" label="Nombre de la marca">
              <Input id="brandName" required value={form.brandName} onChange={(e) => set("brandName", e.target.value)} />
            </Field>
            <Field id="brandWebsite" label="Web de la marca">
              <Input id="brandWebsite" value={form.brandWebsite} onChange={(e) => set("brandWebsite", e.target.value)} placeholder="https://" />
            </Field>
          </div>
          <div className="max-w-[180px]">
            <ImageUpload label="Logo" hint="Cuadrado, PNG o SVG." value={form.brandLogoUrl} onChange={(v) => set("brandLogoUrl", v)} aspect="aspect-square" />
          </div>
          <Field id="brandContext" label="Contexto de la marca" hint="Qué es, qué hace, a quién se dirige, tono de voz. Puedes pegarlo del onboarding.">
            <Textarea id="brandContext" className="min-h-[140px]" value={form.brandContext} onChange={(e) => set("brandContext", e.target.value)} />
          </Field>
          <div>
            <Label>Redes y enlaces de la marca</Label>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {SOCIAL_FIELDS.map((s) => (
                <div key={s.key} className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <Input
                    value={form.socialLinks[s.key] || ""}
                    onChange={(e) => set("socialLinks", { ...form.socialLinks, [s.key]: e.target.value })}
                    placeholder="https://"
                  />
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Campaña" hint="El brief que leen los creadores antes de aplicar.">
          <Field id="title" label="Título">
            <Input id="title" required minLength={3} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ej.: Lanzamiento de la app en Argentina" />
          </Field>
          <ImageUpload label="Imagen de portada" hint="Horizontal (16:9), máx. 4 MB." value={form.coverImageUrl} onChange={(v) => set("coverImageUrl", v)} />
          <Field id="description" label="Brief / descripción">
            <Textarea id="description" required minLength={10} className="min-h-[160px]" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field id="deliverables" label="Entregables" hint="Ej.: 1 Reel + 3 historias con link, publicados entre el 1 y el 7.">
            <Textarea id="deliverables" className="min-h-[100px]" value={form.deliverables} onChange={(e) => set("deliverables", e.target.value)} />
          </Field>
          <Field id="requirements" label="Requisitos y reglas" hint="Mensajes clave, qué no decir, hashtags y disclosure (#publicidad).">
            <Textarea id="requirements" className="min-h-[100px]" value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
          </Field>
        </Section>

        <Section title="Perfil buscado" hint="Ayuda a los creadores a saber si encajan.">
          <Field label="Plataformas">
            <Chips options={CAMPAIGN_PLATFORMS} value={form.platforms} onChange={(v) => set("platforms", v)} />
          </Field>
          <Field label="Países">
            <Chips options={CAMPAIGN_COUNTRIES} value={form.countries} onChange={(v) => set("countries", v)} />
          </Field>
          <Field label="Nichos">
            <Chips options={NICHOS} value={form.nichos} onChange={(v) => set("nichos", v)} />
          </Field>
          <div className="max-w-[220px]">
            <Field id="minFollowers" label="Mínimo de seguidores">
              <Input id="minFollowers" type="number" min={0} value={form.minFollowers} onChange={(e) => set("minFollowers", e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section title="Pago y fechas">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="paymentPerCreator" label="Pago por creador (USDC)">
              <Input id="paymentPerCreator" type="number" min={0} step="any" value={form.paymentPerCreator} onChange={(e) => set("paymentPerCreator", e.target.value)} />
            </Field>
            <Field id="spots" label="Plazas (creadores)">
              <Input id="spots" type="number" min={1} value={form.spots} onChange={(e) => set("spots", e.target.value)} />
            </Field>
            <Field id="budgetUSDC" label="Presupuesto total (USDC)" hint="Interno: no se muestra a los creadores.">
              <Input id="budgetUSDC" type="number" min={0} step="any" required value={form.budgetUSDC} onChange={(e) => set("budgetUSDC", e.target.value)} />
            </Field>
            <Field id="startDate" label="Inicio">
              <Input id="startDate" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </Field>
            <Field id="endDate" label="Fin">
              <Input id="endDate" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </Field>
            <Field id="duration" label="Duración (días)">
              <Input id="duration" type="number" min={1} required value={form.duration} onChange={(e) => set("duration", e.target.value)} />
            </Field>
          </div>
        </Section>

        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 px-4 py-4 backdrop-blur">
          <Button type="submit" variant="outline" disabled={saving}>
            {saving ? "Guardando…" : status === "ACTIVE" ? "Guardar cambios" : "Guardar borrador"}
          </Button>
          {status !== "ACTIVE" && (
            <Button type="button" disabled={saving} onClick={(e) => (e.currentTarget.form?.reportValidity() ? save(true) : null)}>
              Publicar campaña
            </Button>
          )}
          {status === "ACTIVE" && (
            <>
              <Button type="button" variant="outline" onClick={() => setStatus("PAUSED")}>Pausar</Button>
              <Button type="button" variant="outline" onClick={() => setStatus("COMPLETED")}>Finalizar</Button>
            </>
          )}
          {notice && <p className="text-sm text-emerald-700">{notice}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </form>

      {id && (
        <section className="mt-12">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Creadores que aplicaron ({applicants.length})
          </h2>
          {applicants.length === 0 ? (
            <p className="border-t border-border py-8 text-sm text-muted-foreground">Aún no hay aplicaciones.</p>
          ) : (
            <div className="border-t border-border">
              {applicants.map((a) => (
                <div key={a.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-medium text-foreground">{a.profile?.name || a.creator.xHandle || a.creator.igHandle || a.creator.user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.creator.user.email} · {a.profile?.country ? `${a.profile.country} · ` : ""}
                        {a.creator.followerCount.toLocaleString("es")} seguidores · {a.creator.nichos.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={a.status === "ACCEPTED" ? "success" : a.status === "REJECTED" ? "destructive" : "warning"}>
                        {a.status === "ACCEPTED" ? "Seleccionado" : a.status === "REJECTED" ? "No seleccionado" : "Pendiente"}
                      </Badge>
                      {a.status === "PENDING" && (
                        <>
                          <Button size="sm" onClick={() => decide(a.id, "ACCEPTED")}>Aceptar</Button>
                          <Button size="sm" variant="outline" onClick={() => decide(a.id, "REJECTED")}>Rechazar</Button>
                        </>
                      )}
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
