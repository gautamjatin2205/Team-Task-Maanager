import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";

const COOKIE_NAME = "tm_token";

function getSecret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET missing");
  return new TextEncoder().encode(value);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function signAuthToken(payload: { sub: string; name: string; email: string }) {
  return new SignJWT({ name: payload.name, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAuthToken(token: string) {
  const decoded = await jwtVerify(token, getSecret());
  if (!decoded.payload.sub || typeof decoded.payload.sub !== "string") throw new Error("Invalid token");
  return {
    id: decoded.payload.sub,
    name: String(decoded.payload.name ?? ""),
    email: String(decoded.payload.email ?? "")
  };
}

export function attachAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getAuthUserFromRequest(request: Request) {
  const token = request.headers.get("cookie")?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))?.[1];
  if (!token) return null;
  try {
    return await verifyAuthToken(decodeURIComponent(token));
  } catch {
    return null;
  }
}
