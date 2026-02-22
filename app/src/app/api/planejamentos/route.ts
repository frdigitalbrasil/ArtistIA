import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";

// GET /api/planejamentos — lista planejamentos do usuário
export async function GET(request: Request) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const planejamentos = await prisma.planejamento.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
      include: {
        artista: {
          select: { id: true, nomeArtistico: true, genero: true },
        },
      },
    });

    return NextResponse.json(planejamentos);
  } catch (e) {
    console.error("[api/planejamentos GET]", e);
    return NextResponse.json(
      { error: "Erro ao listar planejamentos." },
      { status: 500 }
    );
  }
}

// POST /api/planejamentos — cria um novo planejamento (status GERANDO) e dispara geração
// Body: { artistaId: string }
export async function POST(request: Request) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const artistaId = body?.artistaId;

    if (!artistaId || typeof artistaId !== "string") {
      return NextResponse.json(
        { error: "artistaId é obrigatório." },
        { status: 400 }
      );
    }

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

    const { generatePlanning } = await import("@/services/ai/planning-engine");
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
      include: {
        artista: { select: { id: true, nomeArtistico: true, genero: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("[api/planejamentos POST]", e);
    return NextResponse.json(
      { error: "Erro ao criar planejamento." },
      { status: 500 }
    );
  }
}
