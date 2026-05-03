import { MemberRole, TaskPriority, TaskStatus } from "@prisma/client";
import { prisma } from "@backend/lib/db";
import { hashPassword } from "@backend/lib/auth";

async function main() {
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hashPassword("Password123!");

  const admin = await prisma.user.create({ data: { name: "Ava Admin", email: "admin@taskmanager.dev", passwordHash, role: MemberRole.ADMIN } });
  const member = await prisma.user.create({ data: { name: "Mason Member", email: "member@taskmanager.dev", passwordHash, role: MemberRole.MEMBER } });

  const project = await prisma.project.create({
    data: {
      name: "Website Relaunch",
      description: "Coordinate design and launch delivery.",
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id, role: MemberRole.ADMIN },
          { userId: member.id, role: MemberRole.MEMBER }
        ]
      }
    }
  });

  await prisma.task.create({
    data: {
      title: "Finalize landing page",
      description: "Ship final hero and CTA section",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      projectId: project.id,
      assigneeId: member.id,
      createdById: admin.id
    }
  });
}

main().finally(async () => prisma.$disconnect());
