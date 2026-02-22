"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ArtistaCard } from "@/components/artistas/ArtistaCard";
import type { ArtistaCardData } from "@/components/artistas/ArtistaCard";

export default function ArtistasPage() {
  const [artistas, setArtistas] = useState<ArtistaCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/artistas", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setArtistas(Array.isArray(data) ? data : []);
      })
      .catch(() => setArtistas([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Artistas</h1>
          <p className="text-muted-foreground mt-1">
            Cadastre e gerencie os artistas que você acompanha.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 shrink-0" style={{ color: "#fff" }}>
          <Link href="/dashboard/artistas/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo artista
          </Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : artistas.length === 0 ? (
        <div
          className="rounded-xl border border-dashed border-border p-12 text-center"
          style={{ backgroundColor: "#0a0a0f" }}
        >
          <p className="text-muted-foreground mb-4">Nenhum artista cadastrado ainda.</p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/dashboard/artistas/novo">
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar primeiro artista
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {artistas.map((artista) => (
            <ArtistaCard key={artista.id} artista={artista} />
          ))}
        </div>
      )}
    </div>
  );
}
