import { getAuthUserFromRequest } from "@backend/lib/auth";
import { prisma } from "@backend/lib/db";
import { errorResponse, jsonResponse } from "@backend/lib/http";

export async function GET(request: Request) {
  const session = await getAuthUserFromRequest(request);
  if (!session) return errorResponse("Unauthorized", 401);

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return errorResponse("Unauthorized", 401);

  return jsonResponse({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
