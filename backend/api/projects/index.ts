import { MemberRole } from "@prisma/client";
import { getAuthUserFromRequest } from "@backend/lib/auth";
import { prisma } from "@backend/lib/db";
import { errorResponse, jsonResponse } from "@backend/lib/http";
import { projectSchema } from "@backend/lib/validators";

export async function GET(request: Request) {
  const session = await getAuthUserFromRequest(request);
  if (!session) return errorResponse("Unauthorized", 401);

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: session.id } } },
    include: { members: { include: { user: true } }, tasks: true },
    orderBy: { updatedAt: "desc" }
  });

  return jsonResponse({ projects });
}

export async function POST(request: Request) {
  const session = await getAuthUserFromRequest(request);
  if (!session) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return errorResponse("Invalid project payload", 400, parsed.error.issues);

  // Extract team members if provided
  const teamMembers = (body.teamMembers as Array<{ email: string; role: string }> | undefined) || [];

  // Find users by email for team members
  const users = await Promise.all(
    teamMembers.map(async (member) => {
      const user = await prisma.user.findUnique({ where: { email: member.email } });
      return { user, role: member.role };
    })
  );

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : undefined,
      status: (parsed.data.status as any) || "ACTIVE",
      visibility: (parsed.data.visibility as any) || "PRIVATE",
      createdById: session.id,
      members: {
        create: [
          { userId: session.id, role: MemberRole.ADMIN },
          ...users
            .filter((item) => item.user)
            .map((item) => ({
              userId: item.user!.id,
              role: (item.role === "ADMIN" ? MemberRole.ADMIN : MemberRole.MEMBER) as MemberRole
            }))
        ]
      }
    },
    include: { members: { include: { user: true } } }
  });

  return jsonResponse({ project }, 201);
}
