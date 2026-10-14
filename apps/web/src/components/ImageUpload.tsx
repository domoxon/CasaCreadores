import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";

// Sube una imagen a /api/admin/uploads (Vercel Blob) y devuelve la URL pública.
export function ImageUpload({
  label,
  hint,
  value,
  onChange,
  aspect = "aspect-[16/9]",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    if (file.size > 4 * 1024 * 1024) return setError("La imagen pesa más de 4 MB. Comprímela e inténtalo de nuevo.");
    setBusy(true);
    try {
      const r = await apiFetch<{ url: string }>(`/admin/uploads?name=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      onChange(r.url);
    } catch (err) {
      setError(toUserMessage(err, "No se pudo subir la imagen."));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium leading-none">{label}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className={`relative flex ${aspect} w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30`}>
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 rounded-full bg-background/90 p-1 text-foreground shadow"
              aria-label="Quitar imagen"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <Button type="button" variant="ghost" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
            {busy ? "Subiendo…" : "Subir imagen"}
          </Button>
        )}
      </div>
      {value && (
        <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? "Subiendo…" : "Cambiar imagen"}
        </Button>
      )}
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
