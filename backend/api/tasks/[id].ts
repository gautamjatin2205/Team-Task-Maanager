import { MemberRole } from "@prisma/client";
import { getAuthUserFromRequest } from "@backend/lib/auth";
import { prisma } from "@backend/lib/db";
import { errorResponse, jsonResponse } from "@backend/lib/http";
import { taskUpdateSchema } from "@backend/lib/validators";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthUserFromRequest(request);
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await context.params;
  const task = await prisma.task.findUnique({ where: { id }, include: { project: { include: { members: true } } } });
  if (!task) return errorResponse("Task not found", 404);

  const membership = task.project.members.find((m) => m.userId === session.id);
  if (!membership) return errorResponse("Forbidden", 403);

  const parsed = taskUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return errorResponse("Invalid payload", 400, parsed.error.issues);

  const isAdmin = membership.role === MemberRole.ADMIN;
  const isAssignee = task.assigneeId === session.id;
  if (!isAdmin && !isAssignee) return errorResponse("Forbidden", 403);

  if (!isAdmin) {
    const forbidden = ["title", "description", "dueDate", "priority", "assigneeId"].some((key) => key in parsed.data);
    if (forbidden) return errorResponse("Members can only update status", 403);
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(parsed.data.title ? { title: parsed.data.title } : {}),
      ...(parsed.data.description ? { description: parsed.data.description } : {}),
      ...(parsed.data.dueDate ? { dueDate: new Date(parsed.data.dueDate) } : {}),
      ...(parsed.data.priority ? { priority: parsed.data.priority } : {}),
      ...(parsed.data.assigneeId !== undefined ? { assigneeId: parsed.data.assigneeId } : {}),
      ...(parsed.data.status ? { status: parsed.data.status } : {})
    }
  });

  return jsonResponse({ task: updated });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthUserFromRequest(request);
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await context.params;
  const task = await prisma.task.findUnique({ where: { id }, include: { project: { include: { members: true } } } });
  if (!task) return errorResponse("Task not found", 404);

  const membership = task.project.members.find((m) => m.userId === session.id);
  if (!membership || membership.role !== MemberRole.ADMIN) return errorResponse("Forbidden", 403);

  await prisma.task.delete({ where: { id } });
  return jsonResponse({ ok: true });
}
