import { NextResponse } from "next/server";
import { attachAuthCookie, signAuthToken, verifyPassword } from "@backend/lib/auth";
import { prisma } from "@backend/lib/db";
import { errorResponse, jsonResponse } from "@backend/lib/http";
import { loginSchema } from "@backend/lib/validators";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return errorResponse("Invalid login payload", 400, parsed.error.issues);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) return errorResponse("Invalid email or password", 401);

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return errorResponse("Invalid email or password", 401);

  const token = await signAuthToken({ sub: user.id, name: user.name, email: user.email });
  const response = jsonResponse({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }) as NextResponse;
  attachAuthCookie(response, token);
  return response;
}
