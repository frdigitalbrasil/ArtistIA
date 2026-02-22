"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, FileText, Trash2, CheckCircle, XCircle } from "lucide-react";

const TIPOS = [
  { value: "case", label: "Case" },
  { value: "estrategia", label: "Estratégia" },
  { value: "template", label: "Template" },
  { value: "nota", label: "Nota" },
  { value: "tendencia", label: "Tendência" },
] as const;

interface Documento {
  id: string;
  titulo: string;
  tipo: string;
  conteudo: string;
  arquivo: string | null;
  vetorizado: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MemoriaPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("nota");
  const [conteudo, setConteudo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function loadDocs() {
    fetch("/api/memoria", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setDocumentos(Array.isArray(data) ? data : []))
      .catch(() => setDocumentos([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDocs();
  }, []);

  async function handleSubmitTexto(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) {
      setMessage({ type: "err", text: "Título é obrigatório." });
      return;
    }
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/memoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ titulo: titulo.trim(), tipo, conteudo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Erro ao salvar." });
        return;
      }
      setDocumentos((prev) => [data, ...prev]);
      setTitulo("");
      setConteudo("");
      setMessage({ type: "ok", text: "Documento adicionado." });
    } catch {
      setMessage({ type: "err", text: "Erro de conexão." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("tipo", tipo);
    if (!fd.get("titulo")?.toString()?.trim()) {
      setMessage({ type: "err", text: "Título é obrigatório." });
      return;
    }
    const file = fd.get("file") as File | null;
    if (!file || file.size === 0) {
      setMessage({ type: "err", text: "Selecione um arquivo (PDF, DOC, DOCX ou TXT)." });
      return;
    }
    setMessage(null);
    setUploading(true);
    try {
      const res = await fetch("/api/memoria/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Erro no upload." });
        return;
      }
      setDocumentos((prev) => [data, ...prev]);
      form.reset();
      setMessage({ type: "ok", text: "Arquivo enviado." });
    } catch {
      setMessage({ type: "err", text: "Erro de conexão." });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/memoria/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setDocumentos((prev) => prev.filter((d) => d.id !== id));
        setMessage({ type: "ok", text: "Documento excluído." });
      } else {
        setMessage({ type: "err", text: "Erro ao excluir." });
      }
    } catch {
      setMessage({ type: "err", text: "Erro de conexão." });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Memória (RAG)</h1>
        <p className="text-muted-foreground mt-1">
          Base de conhecimento para a IA. Envie documentos ou texto para enriquecer o planejamento.
        </p>
      </div>

      {message && (
        <p
          className={
            message.type === "ok" ? "text-sm text-emerald-500" : "text-sm text-destructive"
          }
        >
          {message.text}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Adicionar texto</CardTitle>
            <CardDescription>Título, tipo e conteúdo em texto</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTexto} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Case de lançamento sertanejo"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conteudo">Conteúdo (opcional)</Label>
                <Textarea
                  id="conteudo"
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  rows={5}
                  placeholder="Texto que será usado na memória..."
                  className="bg-background/50 resize-y"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary hover:bg-primary/90"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Upload de arquivo</CardTitle>
            <CardDescription>PDF, DOC, DOCX ou TXT (máx. 5MB)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upload-titulo">Título</Label>
                <Input
                  id="upload-titulo"
                  name="titulo"
                  required
                  placeholder="Ex: Briefing do artista"
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Arquivo</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="bg-background/50"
                />
              </div>
              <Button
                type="submit"
                disabled={uploading}
                className="bg-primary hover:bg-primary/90"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Enviar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>Lista da base de conhecimento. Vetorização será feita em background (Fase 2).</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando...
            </p>
          ) : documentos.length === 0 ? (
            <p className="text-muted-foreground">Nenhum documento ainda.</p>
          ) : (
            <ul className="space-y-3">
              {documentos.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0 flex-1 flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "rgba(255, 61, 0, 0.15)" }}
                    >
                      <FileText className="h-5 w-5 text-primary" style={{ color: "#ff3d00" }} />
                    </div>
                    <div>
                      <p className="font-medium truncate">{d.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {TIPOS.find((t) => t.value === d.tipo)?.label ?? d.tipo}
                        {d.arquivo && ` · ${d.arquivo}`}
                        {" · "}
                        {new Date(d.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                        d.vetorizado ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {d.vetorizado ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {d.vetorizado ? "Vetorizado" : "Pendente"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(d.id)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
