import { getAuthUserFromRequest } from "@backend/lib/auth";
import { prisma } from "@backend/lib/db";
import { errorResponse, jsonResponse } from "@backend/lib/http";

export async function GET(request: Request) {
  const session = await getAuthUserFromRequest(request);
  if (!session) return errorResponse("Unauthorized", 401);

  const memberships = await prisma.projectMember.findMany({
    where: { userId: session.id },
    select: { projectId: true, role: true }
  });

  const projectIds = memberships.map((m) => m.projectId);
  if (projectIds.length === 0) {
    return jsonResponse({
      me: { id: session.id, name: session.name, email: session.email },
      projectRoles: [],
      stats: { totalTasks: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 },
      tasksPerUser: [],
      projects: [],
      recentTasks: []
    });
  }

  const [projects, groupedByStatus, overdue, groupedByAssignee, recentTasks] = await Promise.all([
    prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            members: true,
            tasks: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.task.groupBy({
      by: ["status"],
      where: { projectId: { in: projectIds } },
      _count: { _all: true }
    }),
    prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: { not: "DONE" },
        dueDate: { lt: new Date() }
      }
    }),
    prisma.task.groupBy({
      by: ["assigneeId"],
      where: {
        projectId: { in: projectIds },
        assigneeId: { not: null }
      },
      _count: { _all: true }
    }),
    prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        title: true,
        status: true,
        projectId: true,
        assignee: { select: { id: true, name: true } }
      }
    })
  ]);

  const totals = groupedByStatus.reduce(
    (acc, item) => {
      const count = item._count._all;
      acc.totalTasks += count;
      if (item.status === "TODO") acc.todo += count;
      if (item.status === "IN_PROGRESS") acc.inProgress += count;
      if (item.status === "DONE") acc.done += count;
      return acc;
    },
    { totalTasks: 0, todo: 0, inProgress: 0, done: 0 }
  );

  const assigneeIds = groupedByAssignee
    .map((item) => item.assigneeId)
    .filter((id): id is string => Boolean(id));
  const users = assigneeIds.length
    ? await prisma.user.findMany({ where: { id: { in: assigneeIds } }, select: { id: true, name: true } })
    : [];
  const userNameById = new Map(users.map((u) => [u.id, u.name]));

  const tasksPerUser = groupedByAssignee
    .filter((item): item is { assigneeId: string; _count: { _all: number } } => Boolean(item.assigneeId))
    .map((item) => ({
      userId: item.assigneeId,
      name: userNameById.get(item.assigneeId) ?? "Unknown user",
      count: item._count._all
    }));

  return jsonResponse({
    me: { id: session.id, name: session.name, email: session.email },
    projectRoles: memberships,
    stats: {
      totalTasks: totals.totalTasks,
      todo: totals.todo,
      inProgress: totals.inProgress,
      done: totals.done,
      overdue
    },
    tasksPerUser,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      memberCount: p._count.members,
      taskCount: p._count.tasks
    })),
    recentTasks
  });
}
