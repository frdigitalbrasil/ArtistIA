import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    let token = getTokenFromRequest(request);
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value ?? null;
    }
    if (!token) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (e) {
    console.error("[auth/me]", e);
    return NextResponse.json(
      { error: "Erro ao obter dados do usuário." },
      { status: 500 }
    );
  }
}
