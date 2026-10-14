import { CircleCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Chips } from "@/components/Chips";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { CONTENT_TYPES, COUNTRIES, LANGUAGES, NICHOS, PAYOUT_METHODS, PLATFORMS } from "@/lib/applicationOptions";
import { toUserMessage } from "@/lib/errors";

// Solicitud para unirse a la red. Nadie entra sin aprobación: el equipo recibe un email,
// revisa el perfil y, si lo aprueba, el creador recibe un enlace para crear su cuenta.
export function Apply() {
  const [params] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [languages, setLanguages] = useState<string[]>(["Español"]);
  const [contact, setContact] = useState("");
  const [platforms, setPlatforms] = useState<Record<string, string>>({});
  const [followerCount, setFollowerCount] = useState("");
  const [nichos, setNichos] = useState<string[]>([]);
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [payoutMethod, setPayoutMethod] = useState("");
  const [bestPosts, setBestPosts] = useState("");
  const [bio, setBio] = useState("");
  const [accurate, setAccurate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!Object.values(platforms).some((v) => v.trim())) return setError("Añade al menos una red con tu usuario o enlace.");
    if (nichos.length === 0) return setError("Elige al menos un nicho.");
    if (contentTypes.length === 0) return setError("Elige al menos un tipo de contenido.");
    if (languages.length === 0) return setError("Elige al menos un idioma.");
    if (!accurate) return setError("Confirma que la información es correcta.");
    setLoading(true);
    try {
      await apiFetch("/applications", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
          name, email, country, languages, contact,
          platforms: Object.fromEntries(Object.entries(platforms).map(([k, v]) => [k, v.trim()])),
          followerCount: Number(followerCount || 0), nichos, contentTypes, payoutMethod, bestPosts, bio,
          referredBy: params.get("ref"), accurate,
        }),
      });
      setSent(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(toUserMessage(err, "No pudimos enviar tu solicitud. Inténtalo de nuevo en unos minutos."));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="container flex min-h-[calc(100vh-4rem)] max-w-md items-center py-16">
        <Card className="w-full border-none text-center shadow-none sm:border">
          <CardHeader className="items-center">
            <CircleCheck className="mb-2 h-8 w-8 text-emerald-600" strokeWidth={1.5} />
            <CardTitle className="text-xl">¡Solicitud recibida!</CardTitle>
            <CardDescription>
              Revisamos cada perfil a mano. Te escribiremos a <strong>{email}</strong> con la respuesta, normalmente en
              menos de 5 días hábiles.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Para creadores</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Aplica a Casa Creadores
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Somos una red privada: revisamos cada perfil por calidad de contenido, engagement y nicho. Si te aprobamos,
          recibes un email para crear tu cuenta y acceder a campañas pagadas de marcas cripto, fintech y tech.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          ¿Ya te aprobamos?{" "}
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <section className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="country">País</Label>
            <Select id="country" required value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">Elige tu país…</option>
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact">WhatsApp o Telegram</Label>
            <Input id="contact" required value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+54 9 11… o @usuario" />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label>Idiomas en los que creas contenido</Label>
            <Chips options={LANGUAGES} value={languages} onChange={setLanguages} max={3} />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <Label>Tus redes</Label>
            <p className="mt-1 text-xs text-muted-foreground">Usuario o enlace de cada red donde publicas. Deja vacías las que no uses.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PLATFORMS.map((p) => (
              <div key={p} className="flex flex-col gap-1.5">
                <Label htmlFor={`p-${p}`} className="text-xs text-muted-foreground">{p}</Label>
                <Input
                  id={`p-${p}`}
                  value={platforms[p] || ""}
                  onChange={(e) => setPlatforms({ ...platforms, [p]: e.target.value })}
                  placeholder={p === "LinkedIn" || p === "YouTube" ? "Enlace al perfil" : "@usuario"}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="followers">Seguidores totales (aprox.)</Label>
            <Input id="followers" type="number" min={0} required value={followerCount} onChange={(e) => setFollowerCount(e.target.value)} />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label>Nichos (máx. 5)</Label>
            <Chips options={NICHOS} value={nichos} onChange={setNichos} max={5} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Tipo de contenido (máx. 5)</Label>
            <Chips options={CONTENT_TYPES} value={contentTypes} onChange={setContentTypes} max={5} />
          </div>
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="payout">¿Cómo prefieres cobrar?</Label>
            <Select id="payout" required value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)}>
              <option value="">Elige un método…</option>
              {PAYOUT_METHODS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="posts">Tus 3 mejores publicaciones (opcional)</Label>
            <Textarea id="posts" value={bestPosts} onChange={(e) => setBestPosts(e.target.value)} placeholder="Pega los enlaces, uno por línea" className="min-h-[90px]" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bio">Cuéntanos sobre ti y tu audiencia (opcional)</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[90px]" />
          </div>
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input type="checkbox" className="mt-0.5 h-4 w-4" checked={accurate} onChange={(e) => setAccurate(e.target.checked)} />
            Confirmo que la información es correcta. Datos falsos pueden significar la exclusión de la red y de futuras campañas.
          </label>
        </section>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="self-start">
          {loading ? "Enviando..." : "Enviar solicitud"}
        </Button>
      </form>
    </div>
  );
}
