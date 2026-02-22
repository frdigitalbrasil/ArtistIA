import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";

const TIPOS_VALIDOS = ["case", "estrategia", "template", "nota", "tendencia"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// POST /api/memoria/upload — upload de arquivo (PDF, DOC, DOCX, TXT)
export async function POST(request: Request) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const formData = await request.formData();
    const titulo = formData.get("titulo")?.toString()?.trim();
    const tipo = formData.get("tipo")?.toString()?.trim()?.toLowerCase() || "nota";
    const file = formData.get("file") as File | null;

    if (!titulo) {
      return NextResponse.json(
        { error: "Título é obrigatório." },
        { status: 400 }
      );
    }

    if (!TIPOS_VALIDOS.includes(tipo as (typeof TIPOS_VALIDOS)[number])) {
      return NextResponse.json(
        { error: "Tipo inválido. Use: case, estrategia, template, nota, tendencia." },
        { status: 400 }
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Selecione um arquivo (PDF, DOC, DOCX ou TXT)." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 5MB." },
        { status: 400 }
      );
    }

    let conteudo = "";
    const mime = file.type;
    const isText = mime === "text/plain" || file.name.endsWith(".txt");

    if (isText) {
      const buffer = await file.arrayBuffer();
      const decoder = new TextDecoder("utf-8");
      conteudo = decoder.decode(buffer);
    }
    // PDF/DOC: não extraímos texto aqui (depende de lib externa). Salva com conteudo vazio e arquivo = nome.
    const arquivoNome = file.name;

    const doc = await prisma.memoriaDocumento.create({
      data: {
        titulo,
        tipo,
        conteudo: conteudo || "(Conteúdo do arquivo — vetorização pendente)",
        arquivo: arquivoNome,
        vetorizado: false,
      },
    });

    return NextResponse.json(doc);
  } catch (e) {
    console.error("[api/memoria/upload POST]", e);
    return NextResponse.json(
      { error: "Erro ao fazer upload." },
      { status: 500 }
    );
  }
}
