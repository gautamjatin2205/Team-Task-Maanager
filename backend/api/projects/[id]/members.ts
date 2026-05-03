import { MemberRole } from "@prisma/client";
import { getAuthUserFromRequest } from "@backend/lib/auth";
import { prisma } from "@backend/lib/db";
import { errorResponse, jsonResponse } from "@backend/lib/http";
import { memberSchema } from "@backend/lib/validators";

async function isAdmin(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
  return membership?.role === MemberRole.ADMIN;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthUserFromRequest(request);
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await context.params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return errorResponse("Project not found", 404);

  const membership = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId: id, userId: session.id } } });
  if (!membership) return errorResponse("Forbidden", 403);

  const members = await prisma.projectMember.findMany({
    where: { projectId: id },
    include: { user: true },
    orderBy: { joinedAt: "desc" }
  });

  return jsonResponse({ members });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthUserFromRequest(request);
  if (!session) return errorResponse("Unauthorized", 401);
  const { id } = await context.params;
  if (!(await isAdmin(id, session.id))) return errorResponse("Forbidden", 403);

  const parsed = memberSchema.safeParse(await request.json());
  if (!parsed.success) return errorResponse("Invalid payload", 400, parsed.error.issues);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) return errorResponse("User not found", 404);

  const member = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: id, userId: user.id } },
    update: { role: parsed.data.role },
    create: { projectId: id, userId: user.id, role: parsed.data.role },
    include: { user: true }
  });

  return jsonResponse({ member });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthUserFromRequest(request);
  if (!session) return errorResponse("Unauthorized", 401);
  const { id } = await context.params;
  if (!(await isAdmin(id, session.id))) return errorResponse("Forbidden", 403);

  const body = (await request.json().catch(() => ({}))) as { userId?: string };
  if (!body.userId) return errorResponse("userId required", 400);

  await prisma.projectMember.delete({ where: { projectId_userId: { projectId: id, userId: body.userId } } });
  return jsonResponse({ ok: true });
}
