import { Copy, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";
import { describePayout, PAYOUT_STATUS_LABEL, PayoutDetails, SUBMISSION_STATUS } from "@/lib/payout";

interface Row {
  applicationId: string; creatorId: string; name: string; email: string;
  payoutMethod: string | null; payoutDetails: PayoutDetails | null;
  payoutStatus: "NOT_DUE" | "DUE" | "PAID"; payoutAmount: number | null; payoutReference: string | null; paidAt: string | null;
  submissions: Array<{ id: string; contentUrl: string; notes: string; postUrl: string | null; status: string; feedback: string | null; createdAt: string }>;
}

const fmt = (d: string) => new Date(d).toLocaleDateString("es", { day: "numeric", month: "short" });

// Sección "Contenido y pagos" del editor de campaña (ADMIN).
export function AdminSubmissions({ campaignId, defaultPayment }: { campaignId: string; defaultPayment: number | null }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [payout, setPayout] = useState<Record<string, { amount: string; ref: string }>>({});
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setRows(await apiFetch<Row[]>(`/admin/campaigns/${campaignId}/submissions`));
    } catch (err) {
      setError(toUserMessage(err, "No pudimos cargar las entregas."));
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  async function review(id: string, status: "APPROVED" | "CHANGES_REQUESTED" | "VERIFIED") {
    setError(null);
    if (status === "CHANGES_REQUESTED" && !(feedback[id] || "").trim()) {
      return setError("Escribe qué cambios necesitas antes de pedir cambios.");
    }
    try {
      await apiFetch(`/admin/submissions/${id}`, { method: "PATCH", body: JSON.stringify({ status, feedback: feedback[id] || null }) });
      await load();
    } catch (err) {
      setError(toUserMessage(err, "No se pudo guardar la revisión."));
    }
  }

  async function savePayout(r: Row, status: Row["payoutStatus"]) {
    setError(null);
    const p = payout[r.applicationId];
    try {
      await apiFetch(`/admin/campaigns/${campaignId}/applications/${r.applicationId}/payout`, {
        method: "PATCH",
        body: JSON.stringify({
          payoutStatus: status,
          payoutAmount: p?.amount !== undefined && p.amount !== "" ? Number(p.amount) : r.payoutAmount ?? defaultPayment,
          payoutReference: p?.ref !== undefined ? p.ref : r.payoutReference,
        }),
      });
      await load();
    } catch (err) {
      setError(toUserMessage(err, "No se pudo guardar el pago."));
    }
  }

  if (!rows) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">Contenido y pagos</h2>
      <p className="mb-4 text-xs text-muted-foreground">
        Flujo: el creador entrega un enlace → Aprobar (o pedir cambios) → publica y pega el post → Verificar publicado → pago pendiente → Marcar como pagado.
      </p>
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
      {rows.length === 0 ? (
        <p className="border-t border-border py-8 text-sm text-muted-foreground">Acepta creadores para ver aquí sus entregas.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((r) => {
            const payoutLines = describePayout(r.payoutMethod, r.payoutDetails);
            return (
              <div key={r.applicationId} className="rounded-lg border border-border p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <Link to={`/admin/creadores/${r.creatorId}`} className="font-medium text-foreground underline-offset-4 hover:underline">
                    {r.name}
                  </Link>
                  <Badge variant={r.payoutStatus === "PAID" ? "success" : r.payoutStatus === "DUE" ? "warning" : "secondary"}>
                    {PAYOUT_STATUS_LABEL[r.payoutStatus]}
                  </Badge>
                </div>

                {r.submissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Todavía no entregó contenido.</p>
                ) : (
                  <div className="divide-y divide-border border-y border-border">
                    {r.submissions.map((s, i) => {
                      const st = SUBMISSION_STATUS[s.status];
                      return (
                        <div key={s.id} className="flex flex-col gap-2 py-3 text-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <a href={s.contentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium underline">
                              Versión {r.submissions.length - i} · {fmt(s.createdAt)} <ExternalLink className="h-3 w-3" />
                            </a>
                            <Badge variant={st.variant}>{st.label}</Badge>
                          </div>
                          {s.notes && <p className="whitespace-pre-line text-muted-foreground">{s.notes}</p>}
                          {s.feedback && <p className="text-muted-foreground">Tu comentario: {s.feedback}</p>}
                          {s.postUrl && (
                            <a href={s.postUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
                              Post publicado <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {i === 0 && (s.status === "SUBMITTED" || s.status === "CHANGES_REQUESTED") && (
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <Input
                                placeholder="Comentario (obligatorio para pedir cambios)"
                                value={feedback[s.id] || ""}
                                onChange={(e) => setFeedback({ ...feedback, [s.id]: e.target.value })}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => review(s.id, "APPROVED")}>Aprobar</Button>
                                <Button size="sm" variant="outline" onClick={() => review(s.id, "CHANGES_REQUESTED")}>Pedir cambios</Button>
                              </div>
                            </div>
                          )}
                          {i === 0 && s.status === "PUBLISHED" && (
                            <Button size="sm" className="self-start" onClick={() => review(s.id, "VERIFIED")}>Verificar publicado</Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="text-sm">
                    <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Datos de cobro</p>
                    {payoutLines.length === 0 ? (
                      <p className="text-destructive">El creador todavía no cargó sus datos de cobro.</p>
                    ) : (
                      payoutLines.map(([k, v]) => (
                        <p key={k} className="flex items-center gap-1 break-all">
                          <span className="text-muted-foreground">{k}:</span> {v}
                          {(k.startsWith("Dirección") || k.startsWith("Nº") || k.startsWith("Binance") || k.startsWith("Email")) && (
                            <button type="button" aria-label="Copiar" onClick={() => navigator.clipboard.writeText(v)} className="text-muted-foreground hover:text-foreground">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </p>
                      ))
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        placeholder="Importe USDC"
                        value={payout[r.applicationId]?.amount ?? String(r.payoutAmount ?? defaultPayment ?? "")}
                        onChange={(e) => setPayout({ ...payout, [r.applicationId]: { ...(payout[r.applicationId] || { ref: r.payoutReference || "" }), amount: e.target.value } })}
                      />
                      <Input
                        placeholder="Referencia / tx hash"
                        value={payout[r.applicationId]?.ref ?? r.payoutReference ?? ""}
                        onChange={(e) => setPayout({ ...payout, [r.applicationId]: { ...(payout[r.applicationId] || { amount: String(r.payoutAmount ?? defaultPayment ?? "") }), ref: e.target.value } })}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.payoutStatus !== "PAID" ? (
                        <>
                          <Button size="sm" onClick={() => savePayout(r, "PAID")}>Marcar como pagado</Button>
                          {r.payoutStatus === "NOT_DUE" && <Button size="sm" variant="outline" onClick={() => savePayout(r, "DUE")}>Marcar pendiente de pago</Button>}
                        </>
                      ) : (
                        <>
                          <p className="text-xs text-muted-foreground">Pagado el {r.paidAt ? fmt(r.paidAt) : "—"}</p>
                          <Button size="sm" variant="ghost" onClick={() => savePayout(r, "DUE")}>Deshacer pago</Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
