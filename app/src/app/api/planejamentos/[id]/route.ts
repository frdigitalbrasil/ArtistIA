import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";

// GET /api/planejamentos/[id] — retorna um planejamento do usuário
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

    const planejamento = await prisma.planejamento.findFirst({
      where: { id, userId: payload.userId },
      include: {
        artista: {
          select: {
            id: true,
            nome: true,
            nomeArtistico: true,
            genero: true,
            cidadeBase: true,
            tempoCarreira: true,
            objetivo: true,
          },
        },
      },
    });

    if (!planejamento) {
      return NextResponse.json(
        { error: "Planejamento não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(planejamento);
  } catch (e) {
    console.error("[api/planejamentos/[id] GET]", e);
    return NextResponse.json(
      { error: "Erro ao buscar planejamento." },
      { status: 500 }
    );
  }
}
