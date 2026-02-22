import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
);

async function verifyAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return false;
  try {
    await jose.jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuth = await verifyAuth(request);

  // Página inicial: redirecionar para /login (ou /dashboard se já logado)
  if (path === "/") {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rotas públicas: se já logado, vai para o dashboard
  if (path === "/login" || path === "/register") {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Dashboard e subrotas: exige autenticação
  if (path.startsWith("/dashboard")) {
    if (!isAuth) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", path);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/dashboard", "/dashboard/:path*"],
};
