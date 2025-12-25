import { NextResponse } from "next/server"
import { registerUser } from "@/lib/services/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const user = await registerUser(body)
    return NextResponse.json({ user })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to register"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
