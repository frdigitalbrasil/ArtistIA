"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Music2, MapPin, Target, Trash2, Pencil, FileText, Loader2 } from "lucide-react";
import { ArtistaForm, type ArtistaFormData } from "@/components/artistas/ArtistaForm";

interface ArtistaDetail {
  id: string;
  nome: string;
  nomeArtistico: string;
  genero: string;
  cidadeBase: string | null;
  tempoCarreira: string | null;
  objetivo: string | null;
  foto: string | null;
  instagram: string | null;
  facebook: string | null;
  spotify: string | null;
  youtube: string | null;
  tiktok: string | null;
  kwai: string | null;
}

const LINK_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  spotify: "Spotify",
  youtube: "YouTube",
  tiktok: "TikTok",
  kwai: "Kwai",
};

export default function ArtistaDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [artista, setArtista] = useState<ArtistaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [gerandoPlanejamento, setGerandoPlanejamento] = useState(false);

  useEffect(() => {
    fetch(`/api/artistas/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Não encontrado");
        return res.json();
      })
      .then(setArtista)
      .catch(() => setArtista(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(data: ArtistaFormData) {
    setError("");
    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/artistas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erro ao atualizar.");
        return;
      }
      setArtista(json);
      setEditing(false);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDelete() {
    const res = await fetch(`/api/artistas/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      router.push("/dashboard/artistas");
      router.refresh();
    } else {
      setError("Erro ao excluir.");
    }
  }

  async function handleGerarPlanejamento() {
    setError("");
    setGerandoPlanejamento(true);
    try {
      const res = await fetch(`/api/artistas/${id}/diagnostico`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao gerar planejamento.");
        return;
      }
      if (data?.id) {
        router.push(`/dashboard/planejamentos/${data.id}`);
        router.refresh();
      } else {
        router.push("/dashboard/planejamentos");
        router.refresh();
      }
    } catch {
      setError("Erro de conexão ao gerar planejamento.");
    } finally {
      setGerandoPlanejamento(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Carregando...</p>;
  }
  if (!artista) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Artista não encontrado.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/artistas">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  const links = [
    { key: "instagram", url: artista.instagram },
    { key: "facebook", url: artista.facebook },
    { key: "spotify", url: artista.spotify },
    { key: "youtube", url: artista.youtube },
    { key: "tiktok", url: artista.tiktok },
    { key: "kwai", url: artista.kwai },
  ].filter((l) => l.url);

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/artistas/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Editar artista</h1>
        </div>
        {error && (
          <p className="text-sm text-destructive rounded-md bg-destructive/10 p-3">
            {error}
          </p>
        )}
        <ArtistaForm
          defaultValues={{
            nome: artista.nome,
            nomeArtistico: artista.nomeArtistico,
            genero: artista.genero,
            cidadeBase: artista.cidadeBase ?? "",
            tempoCarreira: artista.tempoCarreira ?? "",
            objetivo: artista.objetivo ?? "",
            foto: artista.foto ?? "",
            instagram: artista.instagram ?? undefined,
            facebook: artista.facebook ?? undefined,
            spotify: artista.spotify ?? undefined,
            youtube: artista.youtube ?? undefined,
            tiktok: artista.tiktok ?? undefined,
            kwai: artista.kwai ?? undefined,
          }}
          onSubmit={handleUpdate}
          isLoading={submitLoading}
          submitLabel="Salvar alterações"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/artistas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{artista.nomeArtistico}</h1>
            <p className="text-muted-foreground">{artista.nome}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={handleGerarPlanejamento}
            disabled={gerandoPlanejamento}
            className="gap-2 bg-primary hover:bg-primary/90"
            style={{ color: "#fff" }}
          >
            {gerandoPlanejamento ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Gerar Planejamento
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          {!deleteConfirm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={handleDelete}>
                Confirmar exclusão
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(false)}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-start gap-4">
              {artista.foto ? (
                <div className="relative h-24 w-24 rounded-xl overflow-hidden shrink-0 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artista.foto}
                    alt={artista.nomeArtistico}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="h-24 w-24 rounded-xl shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255, 61, 0, 0.2)" }}
                >
                  <Music2 className="h-12 w-12 text-primary" style={{ color: "#ff3d00" }} />
                </div>
              )}
              <div>
                <CardTitle>{artista.nomeArtistico}</CardTitle>
                <CardDescription>{artista.nome}</CardDescription>
                <span
                  className="inline-block mt-2 text-sm font-medium px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: "rgba(255, 61, 0, 0.15)", color: "#ff3d00" }}
                >
                  {artista.genero}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {artista.cidadeBase && (
              <p className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {artista.cidadeBase}
              </p>
            )}
            {artista.tempoCarreira && (
              <p className="text-sm">
                <span className="text-muted-foreground">Tempo de carreira:</span>{" "}
                {artista.tempoCarreira}
              </p>
            )}
            {artista.objetivo && (
              <p className="flex items-start gap-2 text-sm">
                <Target className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{artista.objetivo}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {links.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Links</CardTitle>
              <CardDescription>Redes sociais e plataformas</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {links.map(({ key, url }) => (
                  <li key={key}>
                    <a
                      href={url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                      style={{ color: "#ff3d00" }}
                    >
                      {LINK_LABELS[key]} →
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
