import type { Campaign } from "@casa-creadores/shared";
import { Megaphone, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiFetch } from "@/lib/api";
import { CAMPAIGN_STATUS_LABEL } from "@/lib/campaignOptions";
import { toUserMessage } from "@/lib/errors";

type Row = Campaign & { _count: { applications: number } };

// Pestaña "Campañas" del panel: listado + acceso a crear/editar/publicar.
export function AdminCampaigns() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Row[]>("/admin/campaigns")
      .then(setRows)
      .catch((err) => setError(toUserMessage(err, "No pudimos cargar las campañas.")));
  }, []);

  return (
    <div className="py-6">
      <div className="mb-4 flex justify-end">
        <Button asChild size="sm">
          <Link to="/admin/campanas/nueva">
            <Plus className="mr-1.5 h-4 w-4" /> Nueva campaña
          </Link>
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {rows && rows.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <Megaphone className="h-8 w-8" strokeWidth={1.5} />
          <p className="text-sm">Todavía no hay campañas. Crea la primera.</p>
        </div>
      )}
      {rows && rows.length > 0 && (
        <div className="border-t border-border">
          {rows.map((c) => (
            <div key={c.id}>
              <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3">
                  {c.brandLogoUrl ? (
                    <img src={c.brandLogoUrl} alt="" className="h-10 w-10 rounded-md border border-border object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-md border border-border bg-muted" />
                  )}
                  <div>
                    <Link to={`/admin/campanas/${c.id}`} className="font-medium text-foreground hover:underline">
                      {c.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {c.brandName || "—"} · {c._count.applications} aplicaciones
                      {c.paymentPerCreator != null ? ` · $${c.paymentPerCreator} por creador` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={c.status === "ACTIVE" ? "success" : c.status === "PAUSED" ? "warning" : "secondary"}>
                    {CAMPAIGN_STATUS_LABEL[c.status]}
                  </Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/admin/campanas/${c.id}`}>Abrir</Link>
                  </Button>
                </div>
              </div>
              <Separator />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
