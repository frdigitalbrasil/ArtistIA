import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SALT_ROUNDS = 10;

interface RegisterBody {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const { name, email, password, phone } = body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const emailNormalized = email.trim().toLowerCase();
    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe um usuário com este email." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: emailNormalized,
        password: passwordHash,
        phone: phone?.trim() || null,
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (e) {
    console.error("[auth/register]", e);
    return NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 }
    );
  }
}
