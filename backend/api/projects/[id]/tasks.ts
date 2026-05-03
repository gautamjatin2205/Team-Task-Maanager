import { MemberRole } from "@prisma/client";
import { getAuthUserFromRequest } from "@backend/lib/auth";
import { prisma } from "@backend/lib/db";
import { errorResponse, jsonResponse } from "@backend/lib/http";
import { taskSchema } from "@backend/lib/validators";

async function isAdmin(projectId: string, userId: string) {
  const m = await prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
  return m?.role === MemberRole.ADMIN;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthUserFromRequest(request);
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await context.params;
  if (!(await isAdmin(id, session.id))) return errorResponse("Forbidden", 403);

  const parsed = taskSchema.safeParse(await request.json());
  if (!parsed.success) return errorResponse("Invalid payload", 400, parsed.error.issues);

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: new Date(parsed.data.dueDate),
      priority: parsed.data.priority,
      status: parsed.data.status ?? "TODO",
      projectId: id,
      assigneeId: parsed.data.assigneeId ?? null,
      createdById: session.id
    },
    include: { assignee: true }
  });

  return jsonResponse({ task }, 201);
}
