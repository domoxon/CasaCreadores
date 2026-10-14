import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DRAFT_LINK, LINK_LABEL, POST_LINKS, submissionLinks } from "@/lib/payout";

/** Lista de enlaces de una entrega (lectura). */
export function LinkList({ s }: { s: Parameters<typeof submissionLinks>[0] }) {
  const links = submissionLinks(s);
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {links.map(([k, v]) => (
        <a
          key={k}
          href={v}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium hover:border-foreground/50 ${k === "draft" ? "border-dashed border-border text-muted-foreground" : "border-border text-foreground"}`}
        >
          {LINK_LABEL[k] || k} <ExternalLink className="h-3 w-3" />
        </a>
      ))}
    </div>
  );
}

/** Campos de enlaces: borrador opcional + un campo por red social. */
export function LinkFields({
  value,
  onChange,
  includeDraft = true,
  highlight = [],
}: {
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  includeDraft?: boolean;
  highlight?: string[];
}) {
  // Primero las redes que pide la campaña.
  const norm = highlight.map((h) => h.toLowerCase());
  const posts = [...POST_LINKS].sort((a, b) => Number(norm.includes(b.label.toLowerCase())) - Number(norm.includes(a.label.toLowerCase())));
  return (
    <div className="flex flex-col gap-4">
      {includeDraft && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="l-draft">{DRAFT_LINK.label} · opcional</Label>
          <Input id="l-draft" value={value.draft || ""} placeholder={DRAFT_LINK.placeholder} onChange={(e) => onChange({ ...value, draft: e.target.value })} />
          <p className="text-xs text-muted-foreground">Si quieres que revisemos antes de publicar. Comparte con acceso “Cualquier persona con el enlace”.</p>
        </div>
      )}
      <div>
        <p className="text-sm font-medium">Enlaces de los posts publicados</p>
        <p className="mt-1 text-xs text-muted-foreground">Rellena solo las redes donde publicaste.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {posts.map((p) => (
          <div key={p.key} className="flex flex-col gap-1.5">
            <Label htmlFor={`l-${p.key}`} className="text-xs text-muted-foreground">{p.label}</Label>
            <Input id={`l-${p.key}`} value={value[p.key] || ""} placeholder={p.placeholder} onChange={(e) => onChange({ ...value, [p.key]: e.target.value })} />
          </div>
        ))}
      </div>
    </div>
  );
}
