import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createSession, verifyPassword } from "@/lib/auth-server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      )
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      )
    }

    await createSession(user.id, user.role)

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        organizationId: user.organizationId,
      },
    })
  } catch (error) {
    console.error("Login error:", error)

    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 },
    )
  }
}
