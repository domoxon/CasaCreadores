import { Wallet } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";
import { CRYPTO_NETWORKS, describePayout, PAYOUT_FIELDS, PAYOUT_METHOD_LABEL, PayoutDetails, PayoutMethod } from "@/lib/payout";

// "Datos de cobro" en el panel del creador: dónde quiere recibir sus pagos.
export function PayoutCard() {
  const [saved, setSaved] = useState<{ method: PayoutMethod | null; details: PayoutDetails | null } | null>(null);
  const [editing, setEditing] = useState(false);
  const [method, setMethod] = useState<PayoutMethod>("CRYPTO");
  const [details, setDetails] = useState<PayoutDetails>({ token: "USDT", network: CRYPTO_NETWORKS[0] });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiFetch<{ method: PayoutMethod | null; details: PayoutDetails | null }>("/creator/payout")
      .then((r) => {
        setSaved(r);
        if (r.method) {
          setMethod(r.method);
          setDetails(r.details || {});
        } else setEditing(true);
      })
      .catch(() => setSaved({ method: null, details: null }));
  }, []);

  function changeMethod(m: PayoutMethod) {
    setMethod(m);
    setDetails(m === "CRYPTO" ? { token: "USDT", network: CRYPTO_NETWORKS[0] } : {});
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const clean = Object.fromEntries(PAYOUT_FIELDS[method].map((f) => [f.key, (details[f.key] || "").trim()]));
      const r = await apiFetch<{ method: PayoutMethod; details: PayoutDetails }>("/creator/payout", {
        method: "PUT",
        body: JSON.stringify({ method, details: clean }),
      });
      setSaved(r);
      setEditing(false);
    } catch (err) {
      setError(toUserMessage(err, "No se pudieron guardar tus datos de cobro."));
    } finally {
      setBusy(false);
    }
  }

  if (!saved) return null;

  return (
    <section className="mb-12 rounded-lg border border-border p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Datos de cobro</h2>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Editar
          </Button>
        )}
      </div>

      {!editing && saved.method ? (
        <dl className="grid gap-2 text-sm sm:grid-cols-[200px_1fr]">
          {describePayout(saved.method, saved.details).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="break-all font-medium text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          {!saved.method && (
            <p className="text-sm text-muted-foreground">Dinos dónde quieres recibir tus pagos. Solo lo ve el equipo de Casa Creadores.</p>
          )}
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="payout-method">Método</Label>
            <Select id="payout-method" value={method} onChange={(e) => changeMethod(e.target.value as PayoutMethod)}>
              {(Object.keys(PAYOUT_METHOD_LABEL) as PayoutMethod[]).map((m) => (
                <option key={m} value={m}>{PAYOUT_METHOD_LABEL[m]}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {PAYOUT_FIELDS[method].map((f) => (
              <div key={f.key} className={`flex flex-col gap-2 ${f.key === "address" || f.key === "account" ? "sm:col-span-2" : ""}`}>
                <Label htmlFor={`p-${f.key}`}>{f.label}</Label>
                {f.key === "token" ? (
                  <Select id="p-token" value={details.token || "USDT"} onChange={(e) => setDetails({ ...details, token: e.target.value })}>
                    <option>USDT</option>
                    <option>USDC</option>
                  </Select>
                ) : f.key === "network" ? (
                  <Select id="p-network" value={details.network || CRYPTO_NETWORKS[0]} onChange={(e) => setDetails({ ...details, network: e.target.value })}>
                    {CRYPTO_NETWORKS.map((n) => <option key={n}>{n}</option>)}
                  </Select>
                ) : (
                  <Input
                    id={`p-${f.key}`}
                    required={!f.optional}
                    value={details[f.key] || ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setDetails({ ...details, [f.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
          {method === "CRYPTO" && (
            <p className="text-xs text-muted-foreground">Revisa bien la red: un pago enviado a una red equivocada no se puede recuperar.</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={busy}>{busy ? "Guardando…" : "Guardar datos de cobro"}</Button>
            {saved.method && (
              <Button type="button" variant="ghost" size="sm" onClick={() => { setEditing(false); setMethod(saved.method!); setDetails(saved.details || {}); }}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
