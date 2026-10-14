import type { User } from "@casa-creadores/shared";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";

// Enlace que recibe el creador aprobado: crea su contraseña y entra a su panel.
export function Activate() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { adoptSession } = useAuth();
  const [invite, setInvite] = useState<{ name: string; email: string } | null>(null);
  const [invalid, setInvalid] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<{ name: string; email: string }>(`/applications/invite/${token}`, { skipAuth: true })
      .then(setInvite)
      .catch((err) => setInvalid(toUserMessage(err, "Este enlace no es válido o ya caducó.")));
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError("Las contraseñas no coinciden.");
    setLoading(true);
    try {
      const data = await apiFetch<{ accessToken: string; refreshToken: string; user: User }>(`/applications/invite/${token}`, {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ password }),
      });
      adoptSession(data.accessToken, data.refreshToken, data.user);
      navigate("/creador", { replace: true });
    } catch (err) {
      setError(toUserMessage(err, "No pudimos crear tu cuenta. Inténtalo de nuevo."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] max-w-md items-center py-16">
      <Card className="w-full border-none shadow-none sm:border">
        {invalid ? (
          <CardHeader>
            <CardTitle className="text-xl">Enlace no válido</CardTitle>
            <CardDescription>
              {invalid} Si ya creaste tu cuenta,{" "}
              <Link to="/login" className="font-medium text-foreground hover:underline">
                inicia sesión
              </Link>
              .
            </CardDescription>
          </CardHeader>
        ) : !invite ? (
          <CardHeader>
            <CardDescription>Cargando…</CardDescription>
          </CardHeader>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-xl">¡Bienvenido, {invite.name.split(" ")[0]}!</CardTitle>
              <CardDescription>Tu solicitud fue aprobada. Crea tu contraseña para entrar a tu panel.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label>Email</Label>
                  <Input value={invite.email} readOnly disabled />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm">Repite la contraseña</Label>
                  <Input id="confirm" type="password" autoComplete="new-password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creando cuenta..." : "Crear mi cuenta"}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
