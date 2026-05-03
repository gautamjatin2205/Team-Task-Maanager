import { z } from "zod";

const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const signupSchema = z.object({
  firstName: z.string().min(2).max(40),
  lastName: z.string().min(2).max(40),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(strongPasswordRegex, "Password must include at least 1 uppercase letter, 1 number, and 1 special symbol")
});

export const loginSchema = signupSchema.pick({ email: true, password: true });

export const projectSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().min(10).max(600),
  startDate: z.string().datetime().optional(),
  deadline: z.string().datetime().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional()
});

export const memberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER")
});

export const taskSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(1000),
  dueDate: z.string().datetime().or(z.string().min(10)),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  assigneeId: z.string().nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional()
});

export const taskUpdateSchema = taskSchema.partial();
