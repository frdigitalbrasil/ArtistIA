import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Extrai o token Bearer do header Authorization.
 */
export function getTokenFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.slice(7) : null;
}

/**
 * Gera um JWT para o usuário após login.
 */
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Valida o JWT e retorna o payload ou null.
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Obtém o payload do JWT a partir do request (header ou cookie). Para uso nas API routes.
 */
export async function getAuthPayload(request: Request): Promise<JWTPayload | null> {
  let token = getTokenFromRequest(request);
  if (!token) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    token = cookieStore.get("auth_token")?.value ?? null;
  }
  if (!token) return null;
  return verifyToken(token);
}
