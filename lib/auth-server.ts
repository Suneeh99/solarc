import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { Role } from "@prisma/client"

const SESSION_COOKIE = "session_token"
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("Missing JWT_SECRET")
  }
  return new TextEncoder().encode(secret)
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string, role: Role) {
  const token = randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  })

  const jwt = await new SignJWT({ token, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresAt)
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  })
  return token
}

export async function clearSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSessionUser() {
  const cookieStore = await cookies()
  const jwt = cookieStore.get(SESSION_COOKIE)?.value
  if (!jwt) return null

  try {
    const { payload } = await jwtVerify(jwt, getSecret())
    const token = payload.token as string
    if (!token) return null
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })
    if (!session || session.expiresAt < new Date()) {
      return null
    }
    return session.user
  } catch {
    return null
  }
}

export function requireRole(userRole: Role, allowed: Role[]) {
  if (!allowed.includes(userRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return null
}
