import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { toUserMessage } from "@/lib/errors";

// Mi cuenta: por ahora, cambiar la contraseña (cualquier rol).
export function Account() {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (next !== confirm) return setError("Las contraseñas nuevas no coinciden.");
    setLoading(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      setMessage("Contraseña actualizada.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(toUserMessage(err, "No se pudo cambiar la contraseña."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] max-w-md items-center py-16">
      <Card className="w-full border-none shadow-none sm:border">
        <CardHeader>
          <CardTitle className="text-xl">Mi cuenta</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="current">Contraseña actual</Label>
              <Input id="current" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new">Nueva contraseña</Label>
              <Input id="new" type="password" autoComplete="new-password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} placeholder="Mínimo 8 caracteres" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm">Repite la nueva contraseña</Label>
              <Input id="confirm" type="password" autoComplete="new-password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-emerald-700">{message}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
