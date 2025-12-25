import { NextResponse } from "next/server"
import { validateUserCredentials } from "@/lib/data-store"
import { attachSessionCookie, createSessionToken } from "@/lib/session"
import { loginSchema } from "@/lib/validations/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid credentials" },
        { status: 400 },
      )
    }

    const user = await validateUserCredentials(parsed.data.email, parsed.data.password)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = await createSessionToken(user)
    const response = NextResponse.json({ user })
    attachSessionCookie(response, token)
    return response
  } catch (error) {
    console.error("[LOGIN_ERROR]", error)
    return NextResponse.json({ error: "Unable to sign you in right now." }, { status: 500 })
  }
}
