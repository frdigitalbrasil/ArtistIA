import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";

// GET /api/artistas — lista artistas do usuário logado
export async function GET(request: Request) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const artistas = await prisma.artista.findMany({
      where: { userId: payload.userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(artistas);
  } catch (e) {
    console.error("[api/artistas GET]", e);
    return NextResponse.json(
      { error: "Erro ao listar artistas." },
      { status: 500 }
    );
  }
}

// POST /api/artistas — cria artista do usuário logado
export async function POST(request: Request) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const {
      nome,
      nomeArtistico,
      genero,
      cidadeBase,
      tempoCarreira,
      objetivo,
      foto,
      instagram,
      facebook,
      spotify,
      youtube,
      tiktok,
      kwai,
    } = body;

    if (!nome?.trim() || !nomeArtistico?.trim() || !genero?.trim()) {
      return NextResponse.json(
        { error: "Nome, nome artístico e gênero são obrigatórios." },
        { status: 400 }
      );
    }

    const artista = await prisma.artista.create({
      data: {
        userId: payload.userId,
        nome: nome.trim(),
        nomeArtistico: nomeArtistico.trim(),
        genero: genero.trim(),
        cidadeBase: cidadeBase?.trim() || null,
        tempoCarreira: tempoCarreira?.trim() || null,
        objetivo: objetivo?.trim() || null,
        foto: foto?.trim() || null,
        instagram: instagram?.trim() || null,
        facebook: facebook?.trim() || null,
        spotify: spotify?.trim() || null,
        youtube: youtube?.trim() || null,
        tiktok: tiktok?.trim() || null,
        kwai: kwai?.trim() || null,
      },
    });

    return NextResponse.json(artista);
  } catch (e) {
    console.error("[api/artistas POST]", e);
    return NextResponse.json(
      { error: "Erro ao criar artista." },
      { status: 500 }
    );
  }
}
