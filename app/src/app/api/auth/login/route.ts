import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

interface LoginBody {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const emailNormalized = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email ou senha incorretos." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Email ou senha incorretos." },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

    // Cookie httpOnly para o middleware proteger rotas
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: "/",
    });

    return res;
  } catch (e) {
    console.error("[auth/login]", e);
    return NextResponse.json(
      { error: "Erro ao fazer login. Tente novamente." },
      { status: 500 }
    );
  }
}
