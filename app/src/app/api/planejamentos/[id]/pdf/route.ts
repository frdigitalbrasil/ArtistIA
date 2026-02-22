import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";
import { buildHtmlFromPlanejamento, generatePdfBuffer } from "@/services/pdf/generator";

// GET /api/planejamentos/[id]/pdf — gera e retorna o PDF para download
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
          select: { nomeArtistico: true },
        },
      },
    });

    if (!planejamento) {
      return NextResponse.json(
        { error: "Planejamento não encontrado." },
        { status: 404 }
      );
    }

    if (planejamento.status !== "CONCLUIDO") {
      return NextResponse.json(
        { error: "O planejamento ainda não foi gerado ou está com erro." },
        { status: 400 }
      );
    }

    const conteudo = planejamento.conteudo as Record<string, unknown>;
    if (!conteudo || typeof conteudo !== "object") {
      return NextResponse.json(
        { error: "Conteúdo do planejamento inválido." },
        { status: 400 }
      );
    }

    const artistaNome =
      planejamento.artista?.nomeArtistico ?? "Artista";
    const data = new Date(planejamento.createdAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const html = buildHtmlFromPlanejamento(conteudo, artistaNome, data);
    const pdfBuffer = await generatePdfBuffer(html);

    const filename = `planejamento-${artistaNome.replace(/\s+/g, "-")}-${id.slice(0, 8)}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (e) {
    console.error("[api/planejamentos/[id]/pdf]", e);
    return NextResponse.json(
      { error: "Erro ao gerar PDF." },
      { status: 500 }
    );
  }
}
