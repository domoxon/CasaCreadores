import { UploadCloud } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LinkFields, LinkList } from "@/components/SubmissionLinks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";
import { PAYOUT_STATUS_LABEL, POST_LINKS, SUBMISSION_STATUS } from "@/lib/payout";

interface Submission {
  id: string; contentUrl: string | null; links: Record<string, string> | null; notes: string; postUrl: string | null;
  status: string; feedback: string | null; createdAt: string;
}
interface Work {
  application: { id: string; status: string; payoutStatus: string; payoutAmount: number | null; paidAt: string | null } | null;
  submissions: Submission[];
}

const fmt = (d: string) => new Date(d).toLocaleDateString("es", { day: "numeric", month: "short" });
const clean = (l: Record<string, string>) => Object.fromEntries(Object.entries(l).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v));

// En la ficha de una campaña en la que el creador fue seleccionado: entregar enlaces
// (borrador en Drive/Dropbox y/o posts publicados por red) y ver el estado del pago.
export function CreatorWorkPanel({ campaignId, platforms = [] }: { campaignId: string; platforms?: string[] }) {
  const [work, setWork] = useState<Work | null>(null);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [postLinks, setPostLinks] = useState<Record<string, Record<string, string>>>({});
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
    const l = clean(links);
    if (Object.keys(l).length === 0) return setError("Añade al menos un enlace: el borrador o el post publicado.");
    setBusy(true);
    try {
      await apiFetch(`/creator/campaigns/${campaignId}/submissions`, { method: "POST", body: JSON.stringify({ links: l, notes }) });
      setLinks({});
      setNotes("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(toUserMessage(err, "No se pudo enviar tu entrega."));
    } finally {
      setBusy(false);
    }
  }

  async function markPublished(id: string) {
    setError(null);
    const l = clean(postLinks[id] || {});
    if (!POST_LINKS.some((p) => l[p.key])) return setError("Pega al menos un enlace del post publicado.");
    try {
      await apiFetch(`/creator/submissions/${id}/published`, { method: "PATCH", body: JSON.stringify({ links: l }) });
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
                  <span className="font-medium text-foreground">Entrega {work.submissions.length - i} · {fmt(s.createdAt)}</span>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
                <LinkList s={s} />
                {s.feedback && <p className="rounded-md bg-muted/50 p-2 text-muted-foreground">Comentarios del equipo: {s.feedback}</p>}
                {s.status === "APPROVED" && (
                  <div className="mt-2 rounded-md border border-border p-3">
                    <p className="mb-3 text-sm text-foreground">¡Aprobado! Publícalo y pega aquí los enlaces de los posts.</p>
                    <LinkFields
                      includeDraft={false}
                      highlight={platforms}
                      value={postLinks[s.id] || {}}
                      onChange={(v) => setPostLinks({ ...postLinks, [s.id]: v })}
                    />
                    <Button size="sm" className="mt-3" onClick={() => markPublished(s.id)}>Ya lo publiqué</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {canSubmit ? (
        <form onSubmit={submit} className="flex flex-col gap-5">
          <LinkFields value={links} onChange={setLinks} highlight={platforms} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Copy del post, fecha en la que piensas publicar…" className="min-h-[80px]" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={busy} className="self-start">
            <UploadCloud className="mr-1.5 h-4 w-4" /> {busy ? "Enviando…" : latest ? "Enviar nueva entrega" : "Enviar entrega"}
          </Button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {latest.status === "SUBMITTED" && <p className="text-sm text-muted-foreground">El equipo está revisando tu borrador. Te avisaremos por email.</p>}
          {latest.status === "PUBLISHED" && <p className="text-sm text-muted-foreground">Estamos verificando tu publicación.</p>}
          {latest.status !== "VERIFIED" && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>Enviar otra entrega</Button>
          )}
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Cobras a los datos de cobro de tu cuenta. <Link to="/creador" className="underline">Revisarlos</Link>
      </p>
    </section>
  );
}
