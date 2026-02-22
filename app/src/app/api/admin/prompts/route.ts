import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";

// GET /api/admin/prompts — lista todos os system prompts
export async function GET(request: Request) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const prompts = await prisma.systemPrompt.findMany({
      orderBy: [{ nome: "asc" }, { versao: "desc" }],
    });

    return NextResponse.json(prompts);
  } catch (e) {
    console.error("[api/admin/prompts GET]", e);
    return NextResponse.json(
      { error: "Erro ao listar prompts." },
      { status: 500 }
    );
  }
}

// POST /api/admin/prompts — cria um novo system prompt
// Body: { nome, descricao?, conteudo }
export async function POST(request: Request) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { nome, descricao, conteudo } = body;

    if (!nome?.trim() || conteudo === undefined) {
      return NextResponse.json(
        { error: "nome e conteudo são obrigatórios." },
        { status: 400 }
      );
    }

    const prompt = await prisma.systemPrompt.create({
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        conteudo: String(conteudo),
      },
    });

    return NextResponse.json(prompt);
  } catch (e) {
    console.error("[api/admin/prompts POST]", e);
    return NextResponse.json(
      { error: "Erro ao criar prompt." },
      { status: 500 }
    );
  }
}

// PUT /api/admin/prompts — atualiza um system prompt
// Body: { id, conteudo?, ativo?, descricao? } ou { nome, conteudo?, ativo?, descricao? }
export async function PUT(request: Request) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { id, nome, conteudo, ativo, descricao } = body;

    if (id) {
      const existing = await prisma.systemPrompt.findUnique({
        where: { id },
      });
      if (!existing) {
        return NextResponse.json(
          { error: "Prompt não encontrado." },
          { status: 404 }
        );
      }
      const updated = await prisma.systemPrompt.update({
        where: { id },
        data: {
          ...(conteudo !== undefined && { conteudo: String(conteudo) }),
          ...(ativo !== undefined && { ativo: Boolean(ativo) }),
          ...(descricao !== undefined && { descricao: descricao?.trim() || null }),
        },
      });
      return NextResponse.json(updated);
    }

    if (nome?.trim()) {
      const existing = await prisma.systemPrompt.findFirst({
        where: { nome: nome.trim() },
        orderBy: { versao: "desc" },
      });
      if (!existing) {
        return NextResponse.json(
          { error: "Prompt não encontrado." },
          { status: 404 }
        );
      }
      const updated = await prisma.systemPrompt.update({
        where: { id: existing.id },
        data: {
          ...(conteudo !== undefined && { conteudo: String(conteudo) }),
          ...(ativo !== undefined && { ativo: Boolean(ativo) }),
          ...(descricao !== undefined && { descricao: descricao?.trim() || null }),
        },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json(
      { error: "Informe id ou nome do prompt." },
      { status: 400 }
    );
  } catch (e) {
    console.error("[api/admin/prompts PUT]", e);
    return NextResponse.json(
      { error: "Erro ao atualizar prompt." },
      { status: 500 }
    );
  }
}
