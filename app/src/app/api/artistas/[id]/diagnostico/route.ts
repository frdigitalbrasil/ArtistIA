import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";
import { generatePlanning } from "@/services/ai/planning-engine";

// POST /api/artistas/[id]/diagnostico — dispara a geração do planejamento (GPT-4o)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAuthPayload(_request);
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id: artistaId } = await params;

    const artista = await prisma.artista.findFirst({
      where: { id: artistaId, userId: payload.userId },
    });

    if (!artista) {
      return NextResponse.json(
        { error: "Artista não encontrado." },
        { status: 404 }
      );
    }

    const titulo = `Planejamento — ${artista.nomeArtistico} (${new Date().toLocaleDateString("pt-BR")})`;

    const planejamento = await prisma.planejamento.create({
      data: {
        titulo,
        artistaId: artista.id,
        userId: payload.userId,
        conteudo: {},
        status: "GERANDO",
        modeloUsado: "gpt-4o",
      },
    });

    try {
      await generatePlanning(
        {
          id: artista.id,
          nome: artista.nome,
          nomeArtistico: artista.nomeArtistico,
          genero: artista.genero,
          cidadeBase: artista.cidadeBase,
          tempoCarreira: artista.tempoCarreira,
          objetivo: artista.objetivo,
          instagram: artista.instagram,
          facebook: artista.facebook,
          spotify: artista.spotify,
          youtube: artista.youtube,
          tiktok: artista.tiktok,
          kwai: artista.kwai,
          dadosColetados: artista.dadosColetados,
        },
        payload.userId,
        planejamento.id
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao gerar planejamento.";
      await prisma.planejamento.update({
        where: { id: planejamento.id },
        data: { status: "ERRO" },
      });
      return NextResponse.json(
        { error: message },
        { status: 502 }
      );
    }

    const updated = await prisma.planejamento.findUnique({
      where: { id: planejamento.id },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("[api/artistas/[id]/diagnostico]", e);
    return NextResponse.json(
      { error: "Erro ao disparar geração." },
      { status: 500 }
    );
  }
}
