"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ArtistaForm, type ArtistaFormData } from "@/components/artistas/ArtistaForm";

export default function NovoArtistaPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: ArtistaFormData) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/artistas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erro ao cadastrar artista.");
        return;
      }
      router.push(`/dashboard/artistas/${json.id}`);
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/artistas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Cadastrar artista</h1>
          <p className="text-muted-foreground mt-1">
            Preencha os dados do artista e os links das redes.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive rounded-md bg-destructive/10 p-3">
          {error}
        </p>
      )}

      <ArtistaForm onSubmit={handleSubmit} isLoading={loading} submitLabel="Cadastrar" />
    </div>
  );
}
