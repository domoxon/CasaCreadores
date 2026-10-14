import { Download, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";

export interface NetworkCreator {
  id: string;
  email: string;
  joinedAt: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  followerCount: number;
  nichos: string[];
  bio: string;
  handles: Record<string, string | null>;
  campaignApplications: number;
  name: string | null;
  country: string | null;
  languages: string[];
  contact: string | null;
  platforms: Record<string, string> | null;
  contentTypes: string[];
  payoutMethod: string | null;
  reviewToken: string | null;
}

const STATUS_LABEL = { VERIFIED: "Aprobado", PENDING: "Pendiente", REJECTED: "Suspendido" } as const;

function socials(c: NetworkCreator): Array<[string, string]> {
  const merged: Record<string, string> = {};
  for (const [k, v] of Object.entries(c.handles)) if (v) merged[k] = v;
  for (const [k, v] of Object.entries(c.platforms || {})) if (v) merged[k] = v;
  return Object.entries(merged);
}

function toCsv(rows: NetworkCreator[]): string {
  const header = ["Nombre", "Email", "País", "Idiomas", "WhatsApp/Telegram", "Redes", "Seguidores", "Nichos", "Contenido", "Cobro", "Estado", "Aplicaciones a campañas", "Alta"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((c) =>
    [
      c.name, c.email, c.country, c.languages.join(" / "), c.contact,
      socials(c).map(([k, v]) => `${k}: ${v}`).join(" | "), c.followerCount, c.nichos.join(" / "),
      c.contentTypes.join(" / "), c.payoutMethod, STATUS_LABEL[c.status], c.campaignApplications,
      new Date(c.joinedAt).toLocaleDateString("es"),
    ].map(esc).join(",")
  );
  return [header.map(esc).join(","), ...lines].join("\n");
}

// Pestaña "Red de creadores" del panel de administración: todos los creadores con cuenta,
// con búsqueda, filtros, cambio de estado y exportación a CSV (se abre en Excel / Sheets).
export function AdminNetwork() {
  const [creators, setCreators] = useState<NetworkCreator[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [country, setCountry] = useState("");
  const [niche, setNiche] = useState("");

  async function load() {
    try {
      setCreators(await apiFetch<NetworkCreator[]>("/admin/network"));
    } catch (err) {
      setError(toUserMessage(err, "No pudimos cargar la red de creadores."));
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function setCreatorStatus(id: string, next: "VERIFIED" | "REJECTED") {
    await apiFetch(`/admin/creators/${id}/verify`, { method: "PATCH", body: JSON.stringify({ status: next }) });
    load();
  }

  const countries = useMemo(() => [...new Set((creators || []).map((c) => c.country).filter(Boolean))].sort() as string[], [creators]);
  const niches = useMemo(() => [...new Set((creators || []).flatMap((c) => c.nichos))].sort(), [creators]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (creators || []).filter((c) => {
      if (status && c.status !== status) return false;
      if (country && c.country !== country) return false;
      if (niche && !c.nichos.includes(niche)) return false;
      if (!q) return true;
      const hay = [c.name, c.email, c.contact, ...socials(c).map(([, v]) => v)].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [creators, query, status, country, niche]);

  function exportCsv() {
    const blob = new Blob(["﻿" + toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `red-creadores-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (error) return <p className="py-10 text-sm text-destructive">{error}</p>;
  if (!creators) return <p className="py-10 text-sm text-muted-foreground">Cargando…</p>;

  const approved = creators.filter((c) => c.status === "VERIFIED");
  const reach = approved.reduce((s, c) => s + c.followerCount, 0);

  return (
    <div className="py-6">
      <div className="mb-6 flex flex-wrap gap-x-10 gap-y-3 text-sm">
        <p><span className="text-2xl font-semibold text-foreground">{approved.length}</span> <span className="text-muted-foreground">aprobados</span></p>
        <p><span className="text-2xl font-semibold text-foreground">{creators.length - approved.length}</span> <span className="text-muted-foreground">pendientes / suspendidos</span></p>
        <p><span className="text-2xl font-semibold text-foreground">{reach.toLocaleString("es")}</span> <span className="text-muted-foreground">seguidores (aprobados)</span></p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Buscar nombre, email, usuario…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="w-36"><Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos</option><option value="VERIFIED">Aprobados</option><option value="PENDING">Pendientes</option><option value="REJECTED">Suspendidos</option>
        </Select></div>
        <div className="w-36"><Select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">Todos los países</option>{countries.map((c) => <option key={c}>{c}</option>)}
        </Select></div>
        <div className="w-40"><Select value={niche} onChange={(e) => setNiche(e.target.value)}>
          <option value="">Todos los nichos</option>{niches.map((n) => <option key={n}>{n}</option>)}
        </Select></div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="mr-1.5 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <Users className="h-8 w-8" strokeWidth={1.5} />
          <p className="text-sm">{creators.length === 0 ? "Todavía no hay creadores en la red." : "Ningún creador coincide con los filtros."}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Creador</th>
                <th className="px-3 py-2 font-medium">País</th>
                <th className="px-3 py-2 font-medium">Redes</th>
                <th className="px-3 py-2 text-right font-medium">Seguidores</th>
                <th className="px-3 py-2 font-medium">Nichos</th>
                <th className="px-3 py-2 font-medium">Cobro</th>
                <th className="px-3 py-2 font-medium">Estado</th>
                <th className="px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="align-top">
                  <td className="px-3 py-3">
                    <Link to={`/admin/creadores/${c.id}`} className="font-medium text-foreground underline-offset-4 hover:underline">
                      {c.name || c.email}
                    </Link>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                    {c.contact && <p className="text-xs text-muted-foreground">{c.contact}</p>}
                    <p className="text-xs text-muted-foreground">Alta {new Date(c.joinedAt).toLocaleDateString("es")} · {c.campaignApplications} aplicaciones</p>
                  </td>
                  <td className="px-3 py-3">{c.country || "—"}{c.languages.length > 0 && <p className="text-xs text-muted-foreground">{c.languages.join(", ")}</p>}</td>
                  <td className="px-3 py-3 text-xs">{socials(c).map(([k, v]) => <p key={k}><span className="text-muted-foreground">{k}:</span> {v}</p>)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{c.followerCount.toLocaleString("es")}</td>
                  <td className="px-3 py-3 text-xs">{c.nichos.join(", ") || "—"}</td>
                  <td className="px-3 py-3 text-xs">{c.payoutMethod || "—"}</td>
                  <td className="px-3 py-3">
                    <Badge variant={c.status === "VERIFIED" ? "success" : c.status === "REJECTED" ? "destructive" : "warning"}>{STATUS_LABEL[c.status]}</Badge>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {c.reviewToken && <Button asChild variant="ghost" size="sm"><a href={`/revisar/${c.reviewToken}`}>Solicitud</a></Button>}
                      {c.status === "VERIFIED" ? (
                        <Button variant="outline" size="sm" onClick={() => setCreatorStatus(c.id, "REJECTED")}>Suspender</Button>
                      ) : (
                        <Button size="sm" onClick={() => setCreatorStatus(c.id, "VERIFIED")}>Aprobar</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
