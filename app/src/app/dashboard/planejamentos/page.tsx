"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { FileText, ChevronRight, Loader2, AlertCircle } from "lucide-react";

interface PlanejamentoItem {
  id: string;
  titulo: string;
  status: string;
  modeloUsado: string;
  createdAt: string;
  artista: {
    id: string;
    nomeArtistico: string;
    genero: string;
  };
}

export default function PlanejamentosPage() {
  const [items, setItems] = useState<PlanejamentoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/planejamentos", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const statusLabel: Record<string, string> = {
    GERANDO: "Gerando...",
    CONCLUIDO: "Concluído",
    ERRO: "Erro",
  };

  const statusColor: Record<string, string> = {
    GERANDO: "text-amber-500",
    CONCLUIDO: "text-emerald-500",
    ERRO: "text-destructive",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Planejamentos</h1>
        <p className="text-muted-foreground mt-1">
          Planejamentos estratégicos gerados por IA para seus artistas.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </p>
      ) : items.length === 0 ? (
        <Card className="border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum planejamento ainda. Gere um a partir da página de um artista.
            </p>
            <Button asChild className="mt-4 bg-primary hover:bg-primary/90">
              <Link href="/dashboard/artistas">Ver artistas</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Card
              key={p.id}
              className="border-border/50 hover:border-primary/30 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(255, 61, 0, 0.15)" }}
                  >
                    <FileText
                      className="h-5 w-5 text-primary"
                      style={{ color: "#ff3d00" }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{p.titulo}</h3>
                    <p className="text-sm text-muted-foreground">
                      {p.artista?.nomeArtistico ?? "—"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${statusColor[p.status] ?? "text-muted-foreground"}`}
                >
                  {p.status === "ERRO" && (
                    <AlertCircle className="h-3.5 w-3" />
                  )}
                  {p.status === "GERANDO" && (
                    <Loader2 className="h-3.5 w-3 animate-spin" />
                  )}
                  {statusLabel[p.status] ?? p.status}
                </span>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-primary hover:bg-primary/10"
                  style={{ color: "#ff3d00" }}
                >
                  <Link href={`/dashboard/planejamentos/${p.id}`}>
                    Ver planejamento
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
