"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LinkInputs, type LinksValues } from "./LinkInputs";
import { GENEROS_MUSICAIS, TEMPOS_CARREIRA } from "@/lib/artista-options";

export interface ArtistaFormData {
  nome: string;
  nomeArtistico: string;
  genero: string;
  cidadeBase: string;
  tempoCarreira: string;
  objetivo: string;
  foto: string;
  instagram?: string;
  facebook?: string;
  spotify?: string;
  youtube?: string;
  tiktok?: string;
  kwai?: string;
}

interface ArtistaFormProps {
  defaultValues?: Partial<ArtistaFormData>;
  onSubmit: (data: ArtistaFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ArtistaForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Salvar",
}: ArtistaFormProps) {
  const [nome, setNome] = useState(defaultValues?.nome ?? "");
  const [nomeArtistico, setNomeArtistico] = useState(
    defaultValues?.nomeArtistico ?? ""
  );
  const [genero, setGenero] = useState(defaultValues?.genero ?? "");
  const [cidadeBase, setCidadeBase] = useState(defaultValues?.cidadeBase ?? "");
  const [tempoCarreira, setTempoCarreira] = useState(
    defaultValues?.tempoCarreira ?? ""
  );
  const [objetivo, setObjetivo] = useState(defaultValues?.objetivo ?? "");
  const [foto, setFoto] = useState(defaultValues?.foto ?? "");
  const [links, setLinks] = useState<LinksValues>({
    instagram: defaultValues?.instagram,
    facebook: defaultValues?.facebook,
    spotify: defaultValues?.spotify,
    youtube: defaultValues?.youtube,
    tiktok: defaultValues?.tiktok,
    kwai: defaultValues?.kwai,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      nome,
      nomeArtistico,
      genero,
      cidadeBase,
      tempoCarreira,
      objetivo,
      foto,
      ...links,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome completo"
            required
            className="bg-background/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nomeArtistico">Nome artístico</Label>
          <Input
            id="nomeArtistico"
            value={nomeArtistico}
            onChange={(e) => setNomeArtistico(e.target.value)}
            placeholder="Nome artístico"
            required
            className="bg-background/50"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="genero">Gênero musical</Label>
          <Select value={genero} onValueChange={setGenero}>
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Selecione o gênero" />
            </SelectTrigger>
            <SelectContent>
              {GENEROS_MUSICAIS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tempoCarreira">Tempo de carreira</Label>
          <Select value={tempoCarreira} onValueChange={setTempoCarreira}>
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {TEMPOS_CARREIRA.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cidadeBase">Cidade-base</Label>
        <Input
          id="cidadeBase"
          value={cidadeBase}
          onChange={(e) => setCidadeBase(e.target.value)}
          placeholder="Ex: São Paulo, SP"
          className="bg-background/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="objetivo">Objetivo principal</Label>
        <Input
          id="objetivo"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          placeholder="Ex: crescer em streams, mais shows, fortalecer marca"
          className="bg-background/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="foto">URL da foto (opcional)</Label>
        <Input
          id="foto"
          type="url"
          value={foto}
          onChange={(e) => setFoto(e.target.value)}
          placeholder="https://..."
          className="bg-background/50"
        />
      </div>

      <div className="space-y-4">
        <Label>Links das redes</Label>
        <LinkInputs values={links} onChange={setLinks} />
      </div>

      <Button
        type="submit"
        className="bg-primary hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
