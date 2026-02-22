import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";

const TIPOS_VALIDOS = ["case", "estrategia", "template", "nota", "tendencia"] as const;

// GET /api/memoria — lista documentos da base de conhecimento
export async function GET(request: Request) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const documentos = await prisma.memoriaDocumento.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(documentos);
  } catch (e) {
    console.error("[api/memoria GET]", e);
    return NextResponse.json(
      { error: "Erro ao listar documentos." },
      { status: 500 }
    );
  }
}

// POST /api/memoria — cria documento (título, tipo, conteúdo em texto)
export async function POST(request: Request) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { titulo, tipo, conteudo } = body;

    if (!titulo?.trim()) {
      return NextResponse.json(
        { error: "Título é obrigatório." },
        { status: 400 }
      );
    }

    const tipoNorm = (tipo?.trim() || "nota").toLowerCase();
    if (!TIPOS_VALIDOS.includes(tipoNorm as (typeof TIPOS_VALIDOS)[number])) {
      return NextResponse.json(
        { error: "Tipo inválido. Use: case, estrategia, template, nota, tendencia." },
        { status: 400 }
      );
    }

    const doc = await prisma.memoriaDocumento.create({
      data: {
        titulo: titulo.trim(),
        tipo: tipoNorm,
        conteudo: typeof conteudo === "string" ? conteudo : "",
      },
    });

    return NextResponse.json(doc);
  } catch (e) {
    console.error("[api/memoria POST]", e);
    return NextResponse.json(
      { error: "Erro ao criar documento." },
      { status: 500 }
    );
  }
}
