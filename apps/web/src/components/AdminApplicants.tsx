import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ratesText } from "@/components/ApplyToCampaign";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";

export type Applicant = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  appliedAt: string;
  platforms: string[];
  requestedRates: Record<string, number> | null;
  pitch: string;
  offerRates: Record<string, number> | null;
  offerNote: string | null;
  offerStatus: "NONE" | "PENDING" | "ACCEPTED" | "DECLINED";
  responseNote: string | null;
  agreedRates: Record<string, number> | null;
  creator: { id: string; xHandle: string | null; igHandle: string | null; followerCount: number; nichos: string[]; user: { email: string } };
  profile: { name: string; country: string; contact: string } | null;
};

function stage(a: Applicant): { key: string; label: string; variant: "success" | "warning" | "destructive" | "secondary" } {
  if (a.status === "ACCEPTED") return { key: "ACCEPTED", label: "Seleccionado", variant: "success" };
  if (a.status === "REJECTED") return { key: "REJECTED", label: "No seleccionado", variant: "destructive" };
  if (a.offerStatus === "PENDING") return { key: "OFFER", label: "Contraoferta enviada", variant: "secondary" };
  if (a.offerStatus === "DECLINED") return { key: "DECLINED", label: "Rechazó contraoferta", variant: "warning" };
  return { key: "PENDING", label: "Pendiente", variant: "warning" };
}

const total = (r?: Record<string, number> | null) => Object.values(r || {}).reduce((s, v) => s + Number(v), 0);

// Lista de aplicantes de una campaña (ADMIN): filtros, tarifas pedidas, aceptar, contraofertar o rechazar.
export function AdminApplicants({ campaignId, platforms, applicants, onChanged }: {
  campaignId: string;
  platforms: string[];
  applicants: Applicant[];
  onChanged: () => void;
}) {
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("");
  const [offering, setOffering] = useState<string | null>(null);
  const [offerRates, setOfferRates] = useState<Record<string, string>>({});
  const [offerNote, setOfferNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return applicants.filter((a) => {
      if (platform && !(a.platforms || []).includes(platform)) return false;
      if (status && stage(a).key !== status) return false;
      if (!s) return true;
      return [a.profile?.name, a.creator.user.email, a.creator.xHandle, a.creator.igHandle].join(" ").toLowerCase().includes(s);
    });
  }, [applicants, q, platform, status]);

  async function decide(id: string, s: "ACCEPTED" | "REJECTED") {
    setError(null);
    try {
      await apiFetch(`/admin/campaigns/${campaignId}/applications/${id}`, { method: "PATCH", body: JSON.stringify({ status: s }) });
      onChanged();
    } catch (err) {
      setError(toUserMessage(err, "No se pudo guardar."));
    }
  }

  function openOffer(a: Applicant) {
    setOffering(a.id);
    setOfferNote("");
    setOfferRates(Object.fromEntries(Object.entries(a.offerRates || a.requestedRates || {}).map(([k, v]) => [k, String(v)])));
  }

  async function sendOffer(id: string) {
    setError(null);
    const rates: Record<string, number> = {};
    for (const [k, v] of Object.entries(offerRates)) {
      if (!Number(v) || Number(v) <= 0) return setError(`Indica una tarifa válida para ${k}.`);
      rates[k] = Number(v);
    }
    try {
      await apiFetch(`/admin/campaigns/${campaignId}/applications/${id}/offer`, { method: "POST", body: JSON.stringify({ rates, note: offerNote }) });
      setOffering(null);
      onChanged();
    } catch (err) {
      setError(toUserMessage(err, "No se pudo enviar la contraoferta."));
    }
  }

  const counts = applicants.reduce<Record<string, number>>((m, a) => ((m[stage(a).key] = (m[stage(a).key] || 0) + 1), m), {});

  return (
    <section className="mt-12">
      <h2 className="mb-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">Creadores que aplicaron ({applicants.length})</h2>
      <p className="mb-4 text-xs text-muted-foreground">
        {counts.PENDING || 0} pendientes · {counts.OFFER || 0} con contraoferta · {counts.ACCEPTED || 0} seleccionados · {counts.REJECTED || 0} no seleccionados
      </p>

      {applicants.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Buscar creador…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {platforms.length > 0 && (
            <div className="w-40"><Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="">Todas las redes</option>{platforms.map((p) => <option key={p}>{p}</option>)}
            </Select></div>
          )}
          <div className="w-48"><Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="OFFER">Contraoferta enviada</option>
            <option value="DECLINED">Rechazó contraoferta</option>
            <option value="ACCEPTED">Seleccionados</option>
            <option value="REJECTED">No seleccionados</option>
          </Select></div>
        </div>
      )}
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      {applicants.length === 0 ? (
        <p className="border-t border-border py-8 text-sm text-muted-foreground">Aún no hay aplicaciones.</p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {filtered.map((a) => {
            const st = stage(a);
            const canDecide = a.status === "PENDING";
            return (
              <div key={a.id} className="py-3 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link to={`/admin/creadores/${a.creator.id}`} className="font-medium text-foreground underline-offset-4 hover:underline">
                      {a.profile?.name || a.creator.xHandle || a.creator.igHandle || a.creator.user.email}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {a.profile?.country ? `${a.profile.country} · ` : ""}{a.creator.followerCount.toLocaleString("es")} seguidores · {a.creator.nichos.join(", ")}
                    </p>
                    <p className="mt-1">
                      <span className="text-muted-foreground">Pide:</span> <span className="font-medium">{a.requestedRates ? ratesText(a.requestedRates) : "—"}</span>
                      {a.requestedRates && Object.keys(a.requestedRates).length > 1 && <span className="text-muted-foreground"> (total ${total(a.requestedRates)})</span>}
                    </p>
                    {(a.offerStatus === "PENDING" || a.offerStatus === "DECLINED") && (
                      <p><span className="text-muted-foreground">Contraoferta:</span> {ratesText(a.offerRates)}{a.offerStatus === "DECLINED" && a.responseNote ? ` · respuesta: “${a.responseNote}”` : ""}</p>
                    )}
                    {a.status === "ACCEPTED" && a.agreedRates && <p><span className="text-muted-foreground">Acordado:</span> <span className="font-medium">{ratesText(a.agreedRates)}</span></p>}
                    {a.pitch && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">“{a.pitch}”</p>}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Badge variant={st.variant}>{st.label}</Badge>
                    {canDecide && (
                      <>
                        <Button size="sm" onClick={() => decide(a.id, "ACCEPTED")}>
                          Aceptar{a.requestedRates ? ` a $${total(a.requestedRates)}` : ""}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => (offering === a.id ? setOffering(null) : openOffer(a))}>Contraofertar</Button>
                        <Button size="sm" variant="ghost" onClick={() => decide(a.id, "REJECTED")}>Rechazar</Button>
                      </>
                    )}
                  </div>
                </div>
                {offering === a.id && (
                  <div className="mt-3 flex flex-col gap-3 rounded-md bg-muted/40 p-3">
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(offerRates).map((k) => (
                        <label key={k} className="flex items-center gap-2 text-sm">
                          <span className="w-20">{k}</span>$
                          <Input type="number" min={1} step="any" className="w-24" value={offerRates[k]} onChange={(e) => setOfferRates({ ...offerRates, [k]: e.target.value })} />
                        </label>
                      ))}
                    </div>
                    <Input value={offerNote} onChange={(e) => setOfferNote(e.target.value)} placeholder="Nota para el creador (p. ej.: nos encanta tu perfil, el presupuesto da para $50)" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => sendOffer(a.id)}>Enviar contraoferta</Button>
                      <Button size="sm" variant="ghost" onClick={() => setOffering(null)}>Cancelar</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <p className="py-6 text-sm text-muted-foreground">Ningún creador coincide con los filtros.</p>}
        </div>
      )}
    </section>
  );
}
