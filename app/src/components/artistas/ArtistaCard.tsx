"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music2, MapPin, ChevronRight } from "lucide-react";

export interface ArtistaCardData {
  id: string;
  nome: string;
  nomeArtistico: string;
  genero: string;
  cidadeBase: string | null;
  tempoCarreira: string | null;
  objetivo: string | null;
  foto: string | null;
}

interface ArtistaCardProps {
  artista: ArtistaCardData;
}

export function ArtistaCard({ artista }: ArtistaCardProps) {
  return (
    <Card className="overflow-hidden border-border/50 bg-card hover:border-primary/30 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          {artista.foto ? (
            <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0 bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artista.foto}
                alt={artista.nomeArtistico}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              className="h-16 w-16 rounded-lg shrink-0 flex items-center justify-center"
              style={{ backgroundColor: "rgba(255, 61, 0, 0.2)" }}
            >
              <Music2 className="h-8 w-8 text-primary" style={{ color: "#ff3d00" }} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg truncate">{artista.nomeArtistico}</h3>
            <p className="text-sm text-muted-foreground truncate">{artista.nome}</p>
            <span
              className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded"
              style={{ backgroundColor: "rgba(255, 61, 0, 0.15)", color: "#ff3d00" }}
            >
              {artista.genero}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2">
        {artista.cidadeBase && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            {artista.cidadeBase}
          </p>
        )}
        {artista.objetivo && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {artista.objetivo}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full justify-between text-primary hover:bg-primary/10"
          style={{ color: "#ff3d00" }}
        >
          <Link href={`/dashboard/artistas/${artista.id}`}>
            Ver detalhes
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
