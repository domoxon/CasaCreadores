import { ExternalLink, UploadCloud } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";
import { PAYOUT_STATUS_LABEL, SUBMISSION_STATUS } from "@/lib/payout";

interface Submission {
  id: string; contentUrl: string; notes: string; postUrl: string | null; status: string;
  feedback: string | null; createdAt: string;
}
interface Work {
  application: { id: string; status: string; payoutStatus: string; payoutAmount: number | null; paidAt: string | null } | null;
  submissions: Submission[];
}

const fmt = (d: string) => new Date(d).toLocaleDateString("es", { day: "numeric", month: "short" });

// En la ficha de una campaña en la que el creador fue seleccionado: entregar contenido
// (enlace a Drive/Dropbox), pegar el post publicado y ver el estado del pago.
export function CreatorWorkPanel({ campaignId }: { campaignId: string }) {
  const [work, setWork] = useState<Work | null>(null);
  const [contentUrl, setContentUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [postUrls, setPostUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setWork(await apiFetch<Work>(`/creator/campaigns/${campaignId}/work`));
  }
  useEffect(() => {
    load().catch(() => setWork({ application: null, submissions: [] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await apiFetch(`/creator/campaigns/${campaignId}/submissions`, { method: "POST", body: JSON.stringify({ contentUrl, notes }) });
      setContentUrl("");
      setNotes("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(toUserMessage(err, "No se pudo enviar tu contenido."));
    } finally {
      setBusy(false);
    }
  }

  async function markPublished(id: string) {
    setError(null);
    try {
      await apiFetch(`/creator/submissions/${id}/published`, { method: "PATCH", body: JSON.stringify({ postUrl: postUrls[id] || "" }) });
      await load();
    } catch (err) {
      setError(toUserMessage(err, "No se pudo guardar el enlace."));
    }
  }

  if (!work?.application || work.application.status !== "ACCEPTED") return null;

  const latest = work.submissions[0];
  const canSubmit = !latest || latest.status === "CHANGES_REQUESTED" || showForm;
  const app = work.application;

  return (
    <section className="mb-12 rounded-lg border border-border p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Tu entrega</h2>
        <span className="text-sm text-muted-foreground">
          Pago: <span className="font-medium text-foreground">{PAYOUT_STATUS_LABEL[app.payoutStatus]}</span>
          {app.payoutAmount != null && ` · $${app.payoutAmount.toLocaleString("es")} USDC`}
        </span>
      </div>

      {work.submissions.length > 0 && (
        <div className="mb-5 divide-y divide-border border-y border-border">
          {work.submissions.map((s, i) => {
            const st = SUBMISSION_STATUS[s.status];
            return (
              <div key={s.id} className="flex flex-col gap-2 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a href={s.contentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-foreground underline">
                    Versión {work.submissions.length - i} · {fmt(s.createdAt)} <ExternalLink className="h-3 w-3" />
                  </a>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
                {s.feedback && <p className="rounded-md bg-muted/50 p-2 text-muted-foreground">Comentarios del equipo: {s.feedback}</p>}
                {s.postUrl && (
                  <a href={s.postUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground underline">
                    Post publicado <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {s.status === "APPROVED" && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      placeholder="Pega el enlace del post publicado (https://…)"
                      value={postUrls[s.id] || ""}
                      onChange={(e) => setPostUrls({ ...postUrls, [s.id]: e.target.value })}
                    />
                    <Button size="sm" onClick={() => markPublished(s.id)}>Ya lo publiqué</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {canSubmit ? (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="contentUrl">Enlace a tu contenido</Label>
            <Input id="contentUrl" required value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} placeholder="https://drive.google.com/… o https://www.dropbox.com/…" />
            <p className="text-xs text-muted-foreground">
              Sube el video o las imágenes a Google Drive o Dropbox y comparte el enlace con acceso “Cualquier persona con el enlace”.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Copy del post, fecha en la que piensas publicar…" className="min-h-[80px]" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={busy} className="self-start">
            <UploadCloud className="mr-1.5 h-4 w-4" /> {busy ? "Enviando…" : latest ? "Enviar nueva versión" : "Enviar contenido"}
          </Button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {latest.status === "SUBMITTED" && <p className="text-sm text-muted-foreground">El equipo está revisando tu contenido. Te avisaremos por email.</p>}
          {latest.status !== "VERIFIED" && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>Enviar otra versión</Button>
          )}
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Cobras a los datos de cobro de tu cuenta. <Link to="/creador" className="underline">Revisarlos</Link>
      </p>
    </section>
  );
}
