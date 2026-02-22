"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, ToggleLeft, ToggleRight, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SystemPromptItem {
  id: string;
  nome: string;
  descricao: string | null;
  conteudo: string;
  versao: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<SystemPromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newNome, setNewNome] = useState("");
  const [newDescricao, setNewDescricao] = useState("");
  const [newConteudo, setNewConteudo] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/admin/prompts", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setPrompts(list);
        if (list.length > 0) {
          setEditingId(list[0].id);
          setEditContent(list[0].conteudo);
        }
      })
      .catch(() => setPrompts([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load prompts once on mount
  }, []);

  useEffect(() => {
    const p = prompts.find((x) => x.id === editingId);
    if (p) setEditContent(p.conteudo);
  }, [editingId, prompts]);

  async function handleSave() {
    if (!editingId) return;
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: editingId, conteudo: editContent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Erro ao salvar." });
        return;
      }
      setPrompts((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, conteudo: editContent } : p))
      );
      setMessage({ type: "ok", text: "Prompt salvo." });
    } catch {
      setMessage({ type: "err", text: "Erro de conexão." });
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    if (!newNome.trim() || !newConteudo.trim()) {
      setMessage({ type: "err", text: "Nome e conteúdo são obrigatórios." });
      return;
    }
    setMessage(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nome: newNome.trim(),
          descricao: newDescricao.trim() || undefined,
          conteudo: newConteudo,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Erro ao criar." });
        return;
      }
      setPrompts((prev) => [...prev, data]);
      setEditingId(data.id);
      setEditContent(data.conteudo);
      setShowNew(false);
      setNewNome("");
      setNewDescricao("");
      setNewConteudo("");
      setMessage({ type: "ok", text: "Prompt criado." });
    } catch {
      setMessage({ type: "err", text: "Erro de conexão." });
    } finally {
      setCreating(false);
    }
  }

  async function toggleAtivo(p: SystemPromptItem) {
    setMessage(null);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: p.id, ativo: !p.ativo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Erro ao atualizar." });
        return;
      }
      setPrompts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, ativo: !x.ativo } : x))
      );
      setMessage({ type: "ok", text: p.ativo ? "Prompt desativado." : "Prompt ativado." });
    } catch {
      setMessage({ type: "err", text: "Erro de conexão." });
    }
  }

  if (loading) {
    return (
      <p className="text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Prompts</h1>
        <p className="text-muted-foreground mt-1">
          Edite os prompts usados pela IA (planejamento e WhatsApp). O motor de planejamento usa o prompt ativo com nome &quot;planejamento_principal&quot;.
        </p>
      </div>

      {message && (
        <p
          className={
            message.type === "ok"
              ? "text-sm text-emerald-500"
              : "text-sm text-destructive"
          }
        >
          {message.text}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 border-border/50">
          <CardHeader>
            <CardTitle>Prompts</CardTitle>
            <CardDescription>Selecione um para editar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center gap-2"
              onClick={() => setShowNew(!showNew)}
            >
              <Plus className="h-4 w-4" />
              Novo prompt
            </Button>
            {showNew && (
              <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/30">
                <Input
                  placeholder="Nome (ex: meu_prompt)"
                  value={newNome}
                  onChange={(e) => setNewNome(e.target.value)}
                  className="bg-background/50"
                />
                <Input
                  placeholder="Descrição (opcional)"
                  value={newDescricao}
                  onChange={(e) => setNewDescricao(e.target.value)}
                  className="bg-background/50"
                />
                <Textarea
                  placeholder="Conteúdo do prompt..."
                  value={newConteudo}
                  onChange={(e) => setNewConteudo(e.target.value)}
                  rows={4}
                  className="bg-background/50 text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreate} disabled={creating} className="bg-primary hover:bg-primary/90">
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Criar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowNew(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            {prompts.length === 0 && !showNew ? (
              <p className="text-sm text-muted-foreground">
                Nenhum prompt. Crie um acima ou execute: npm run seed:prompts
              </p>
            ) : (
              prompts.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                    editingId === p.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/50"
                  }`}
                  style={
                    editingId === p.id
                      ? { borderColor: "#ff3d00", backgroundColor: "rgba(255, 61, 0, 0.1)" }
                      : undefined
                  }
                  onClick={() => setEditingId(p.id)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{p.nome}</p>
                    {p.descricao && (
                      <p className="text-xs text-muted-foreground truncate">{p.descricao}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      v{p.versao} · {new Date(p.updatedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAtivo(p);
                    }}
                    title={p.ativo ? "Desativar" : "Ativar"}
                    className="shrink-0"
                  >
                    {p.ativo ? (
                      <ToggleRight className="h-6 w-6 text-primary" style={{ color: "#ff3d00" }} />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                    )}
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Conteúdo</CardTitle>
            <CardDescription>
              {prompts.find((p) => p.id === editingId)?.nome ?? "Selecione um prompt"}
              {editingId && (() => {
                const p = prompts.find((x) => x.id === editingId);
                return p ? ` · v${p.versao} · Atualizado em ${new Date(p.updatedAt).toLocaleString("pt-BR")}` : "";
              })()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conteudo">Texto do prompt</Label>
              <Textarea
                id="conteudo"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={18}
                className="font-mono text-sm bg-background/50 resize-y"
                placeholder="System prompt..."
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !editingId}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
