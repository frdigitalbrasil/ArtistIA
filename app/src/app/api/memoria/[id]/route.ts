import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";

// DELETE /api/memoria/[id] — exclui documento
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

    await prisma.memoriaDocumento.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[api/memoria/[id] DELETE]", e);
    return NextResponse.json(
      { error: "Documento não encontrado ou erro ao excluir." },
      { status: 500 }
    );
  }
}
