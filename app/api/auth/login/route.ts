import { NextResponse } from "next/server"
import { loginUser } from "@/lib/services/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const user = await loginUser(body)

    return NextResponse.json({ user })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to login"

    return NextResponse.json({ error: message }, { status: 401 })
  }
}
