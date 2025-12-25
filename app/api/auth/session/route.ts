import { NextResponse } from "next/server"
import { getPublicUserById } from "@/lib/data-store"
import {
  attachSessionCookie,
  clearSessionCookie,
  createSessionToken,
  getSessionTokenFromCookies,
  verifySessionToken,
} from "@/lib/session"

export async function GET() {
  const token = getSessionTokenFromCookies()
  const payload = await verifySessionToken(token)

  if (!payload) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    clearSessionCookie(response)
    return response
  }

  const user = await getPublicUserById(payload.sub)

  if (!user) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    clearSessionCookie(response)
    return response
  }

  const refreshedToken = await createSessionToken(user)
  const response = NextResponse.json({ user })
  attachSessionCookie(response, refreshedToken)
  return response
}
