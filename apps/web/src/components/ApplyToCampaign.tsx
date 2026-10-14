import type { CampaignApplication } from "@casa-creadores/shared";
import { FormEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";

export const ratesText = (r?: Record<string, number> | null) =>
  Object.entries(r || {}).map(([k, v]) => `${k} $${Number(v).toLocaleString("es")}`).join(" · ");

// Aplicar a una campaña eligiendo redes y la tarifa por video en cada una.
export function ApplyForm({
  campaignId,
  platforms,
  onApplied,
}: {
  campaignId: string;
  platforms: string[];
  onApplied: (a: CampaignApplication) => void;
}) {
  const options = platforms.length > 0 ? platforms : ["General"];
  const [selected, setSelected] = useState<string[]>(options.length === 1 ? options : []);
  const [rates, setRates] = useState<Record<string, string>>({});
  const [pitch, setPitch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function toggle(p: string) {
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (selected.length === 0) return setError("Elige al menos una red.");
    const body: Record<string, number> = {};
    for (const p of selected) {
      const v = Number(rates[p]);
      if (!v || v <= 0) return setError(`Indica tu tarifa por video en ${p}.`);
      body[p] = v;
    }
    setBusy(true);
    try {
      const a = await apiFetch<CampaignApplication>(`/campaigns/${campaignId}/apply`, {
        method: "POST",
        body: JSON.stringify({ rates: body, pitch }),
      });
      onApplied(a);
    } catch (err) {
      setError(toUserMessage(err, "No se pudo enviar tu aplicación."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-lg border border-border p-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">Aplicar a esta campaña</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Elige en qué redes quieres participar y cuánto cobrarías por video en cada una (USD). El equipo puede aceptar tu tarifa o hacerte una contraoferta.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {options.map((p) => (
          <div key={p} className="flex flex-wrap items-center gap-3">
            <label className="flex w-36 items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="h-4 w-4" checked={selected.includes(p)} onChange={() => toggle(p)} />
              {p}
            </label>
            {selected.includes(p) && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <Input
                  type="number"
                  min={1}
                  step="any"
                  className="w-28"
                  aria-label={`Tarifa por video en ${p}`}
                  value={rates[p] || ""}
                  onChange={(e) => setRates({ ...rates, [p]: e.target.value })}
                  placeholder="60"
                />
                <span className="text-sm text-muted-foreground">por video</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pitch">¿Por qué encajas? (opcional)</Label>
        <Textarea id="pitch" value={pitch} onChange={(e) => setPitch(e.target.value)} className="min-h-[80px]" placeholder="Tu idea para el contenido, resultados de campañas parecidas…" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={busy} className="self-start">{busy ? "Enviando…" : "Enviar aplicación"}</Button>
    </form>
  );
}

// Estado de mi aplicación: mi propuesta y, si hay, la contraoferta del equipo.
export function MyApplicationCard({
  campaignId,
  application,
  onChange,
}: {
  campaignId: string;
  application: CampaignApplication;
  onChange: () => void;
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const a = application;

  async function respond(action: "accept" | "decline") {
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`/creator/campaigns/${campaignId}/offer`, { method: "POST", body: JSON.stringify({ action, note }) });
      onChange();
    } catch (err) {
      setError(toUserMessage(err, "No se pudo enviar tu respuesta."));
    } finally {
      setBusy(false);
    }
  }

  const status =
    a.status === "ACCEPTED" ? (["¡Fuiste seleccionado!", "success"] as const)
    : a.status === "REJECTED" ? (["No seleccionado esta vez", "destructive"] as const)
    : a.offerStatus === "PENDING" ? (["Tienes una contraoferta", "warning"] as const)
    : (["Aplicaste · en revisión", "warning"] as const);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">Tu aplicación</h2>
        <Badge variant={status[1]}>{status[0]}</Badge>
      </div>
      {a.requestedRates && <p><span className="text-muted-foreground">Tu tarifa:</span> {ratesText(a.requestedRates)}</p>}
      {a.status === "ACCEPTED" && a.agreedRates && (
        <p><span className="text-muted-foreground">Tarifa acordada:</span> <span className="font-medium">{ratesText(a.agreedRates)}</span></p>
      )}
      {a.offerStatus === "PENDING" && a.status === "PENDING" && (
        <div className="flex flex-col gap-3 rounded-md bg-muted/50 p-4">
          <p className="text-foreground">
            Queremos trabajar contigo con esta tarifa: <span className="font-semibold">{ratesText(a.offerRates)}</span>
          </p>
          {a.offerNote && <p className="whitespace-pre-line text-muted-foreground">“{a.offerNote}”</p>}
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota para el equipo (opcional)" />
          {error && <p className="text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" disabled={busy} onClick={() => respond("accept")}>Aceptar propuesta</Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => respond("decline")}>Rechazar</Button>
          </div>
        </div>
      )}
      {a.offerStatus === "DECLINED" && a.status === "PENDING" && (
        <p className="text-muted-foreground">Rechazaste la contraoferta ({ratesText(a.offerRates)}). El equipo puede enviarte otra.</p>
      )}
    </div>
  );
}
