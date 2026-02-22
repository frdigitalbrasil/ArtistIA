"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, FileText, Download } from "lucide-react";

interface PlanejamentoDetail {
  id: string;
  titulo: string;
  status: string;
  conteudo: Record<string, unknown>;
  modeloUsado: string;
  tokensUsados: number | null;
  createdAt: string;
  artista: {
    id: string;
    nome: string;
    nomeArtistico: string;
    genero: string;
    cidadeBase: string | null;
    tempoCarreira: string | null;
    objetivo: string | null;
  };
}

function renderConteudo(value: unknown, depth = 0): React.ReactNode {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    return <p className="whitespace-pre-wrap text-sm">{value}</p>;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return <span className="text-sm">{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-5 space-y-1 text-sm">
        {value.map((item, i) => (
          <li key={i}>{renderConteudo(item, depth)}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return (
      <div className={depth > 0 ? "pl-4 border-l border-border space-y-3" : "space-y-4"}>
        {Object.entries(obj).map(([key, val]) => (
          <div key={key}>
            <h4 className="font-medium text-sm text-primary mt-2 mb-1" style={{ color: "#ff3d00" }}>
              {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
            </h4>
            <div className="text-muted-foreground">{renderConteudo(val, depth + 1)}</div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function PlanejamentoViewPage() {
  const params = useParams();
  const id = params.id as string;
  const [planejamento, setPlanejamento] = useState<PlanejamentoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    fetch(`/api/planejamentos/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Não encontrado");
        return res.json();
      })
      .then(setPlanejamento)
      .catch(() => setPlanejamento(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <p className="text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando...
      </p>
    );
  }

  async function handleDownloadPdf() {
    if (!planejamento?.id) return;
    setDownloadingPdf(true);
    try {
      const res = await fetch(`/api/planejamentos/${planejamento.id}/pdf`, {
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Erro ao baixar PDF.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `planejamento-${planejamento.artista?.nomeArtistico ?? "artista"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingPdf(false);
    }
  }

  if (!planejamento) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Planejamento não encontrado.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/planejamentos">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/planejamentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{planejamento.titulo}</h1>
            <p className="text-muted-foreground text-sm">
              {planejamento.artista?.nomeArtistico} · {planejamento.modeloUsado}
              {planejamento.tokensUsados != null && ` · ${planejamento.tokensUsados} tokens`}
            </p>
          </div>
        </div>
        {planejamento.status === "CONCLUIDO" && (
          <Button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="bg-primary hover:bg-primary/90 shrink-0"
            style={{ color: "#fff" }}
          >
            {downloadingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Baixar PDF
          </Button>
        )}
      </div>

      {planejamento.status === "GERANDO" && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="flex items-center gap-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            <span>Planejamento está sendo gerado. Atualize a página em instantes.</span>
          </CardContent>
        </Card>
      )}

      {planejamento.status === "ERRO" && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-4">
            <p className="text-destructive">Ocorreu um erro ao gerar este planejamento.</p>
          </CardContent>
        </Card>
      )}

      {planejamento.status === "CONCLUIDO" && planejamento.conteudo && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" style={{ color: "#ff3d00" }} />
              Conteúdo do planejamento
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            {renderConteudo(planejamento.conteudo)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
