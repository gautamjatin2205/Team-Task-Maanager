import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { attachAuthCookie, hashPassword, signAuthToken } from "@backend/lib/auth";
import { prisma } from "@backend/lib/db";
import { errorResponse, jsonResponse } from "@backend/lib/http";
import { signupSchema } from "@backend/lib/validators";

export async function POST(request: Request) {
  try {
    const body = signupSchema.parse(await request.json());
    const name = `${body.firstName.trim()} ${body.lastName.trim()}`;
    const user = await prisma.user.create({
      data: {
        name,
        email: body.email.toLowerCase(),
        passwordHash: await hashPassword(body.password),
        role: body.role
      }
    });

    const token = await signAuthToken({ sub: user.id, name: user.name, email: user.email });
    const response = jsonResponse({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 201) as NextResponse;
    attachAuthCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorResponse("Email already registered", 409);
    }
    if (error instanceof ZodError) return errorResponse("Invalid signup payload", 400, error.issues);
    return errorResponse("Unable to signup", 500);
  }
}
