import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";

async function getArtistaForUser(id: string, userId: string) {
  return prisma.artista.findFirst({
    where: { id, userId },
  });
}

// GET /api/artistas/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const artista = await getArtistaForUser(id, payload.userId);
    if (!artista) {
      return NextResponse.json({ error: "Artista não encontrado." }, { status: 404 });
    }

    return NextResponse.json(artista);
  } catch (e) {
    console.error("[api/artistas/[id] GET]", e);
    return NextResponse.json(
      { error: "Erro ao buscar artista." },
      { status: 500 }
    );
  }
}

// PUT /api/artistas/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getArtistaForUser(id, payload.userId);
    if (!existing) {
      return NextResponse.json({ error: "Artista não encontrado." }, { status: 404 });
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

    const artista = await prisma.artista.update({
      where: { id },
      data: {
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
    console.error("[api/artistas/[id] PUT]", e);
    return NextResponse.json(
      { error: "Erro ao atualizar artista." },
      { status: 500 }
    );
  }
}

// DELETE /api/artistas/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getArtistaForUser(id, payload.userId);
    if (!existing) {
      return NextResponse.json({ error: "Artista não encontrado." }, { status: 404 });
    }

    await prisma.artista.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[api/artistas/[id] DELETE]", e);
    return NextResponse.json(
      { error: "Erro ao excluir artista." },
      { status: 500 }
    );
  }
}
