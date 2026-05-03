import { MemberRole } from "@prisma/client";
import { getAuthUserFromRequest } from "@backend/lib/auth";
import { prisma } from "@backend/lib/db";
import { errorResponse, jsonResponse } from "@backend/lib/http";
import { projectSchema } from "@backend/lib/validators";

async function getMembership(projectId: string, userId: string) {
  return prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthUserFromRequest(request);
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await context.params;
  const membership = await getMembership(id, session.id);
  if (!membership) return errorResponse("Forbidden", 403);

  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: { include: { user: true } }, tasks: { include: { assignee: true } } }
  });
  if (!project) return errorResponse("Not found", 404);

  return jsonResponse({ project, membership, currentUserId: session.id });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthUserFromRequest(request);
  if (!session) return errorResponse("Unauthorized", 401);
  const { id } = await context.params;

  const membership = await getMembership(id, session.id);
  if (!membership || membership.role !== MemberRole.ADMIN) return errorResponse("Forbidden", 403);

  const parsed = projectSchema.partial().safeParse(await request.json());
  if (!parsed.success) return errorResponse("Invalid payload", 400, parsed.error.issues);

  const project = await prisma.project.update({ where: { id }, data: parsed.data });
  return jsonResponse({ project });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthUserFromRequest(request);
  if (!session) return errorResponse("Unauthorized", 401);
  const { id } = await context.params;

  const membership = await getMembership(id, session.id);
  if (!membership || membership.role !== MemberRole.ADMIN) return errorResponse("Forbidden", 403);

  await prisma.project.delete({ where: { id } });
  return jsonResponse({ ok: true });
}
