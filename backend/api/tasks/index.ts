import { getAuthUserFromRequest } from "@backend/lib/auth";
import { prisma } from "@backend/lib/db";
import { errorResponse, jsonResponse } from "@backend/lib/http";

export async function GET(request: Request) {
  const session = await getAuthUserFromRequest(request);
  if (!session) return errorResponse("Unauthorized", 401);

  const tasks = await prisma.task.findMany({
    where: {
      project: {
        members: {
          some: { userId: session.id }
        }
      }
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true
        }
      },
      project: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { dueDate: "asc" }
  });

  return jsonResponse({ tasks });
}