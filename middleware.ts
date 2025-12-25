import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session"

const protectedRoutes: Array<{ prefix: string; role: string }> = [
  { prefix: "/customer", role: "customer" },
  { prefix: "/installer", role: "installer" },
  { prefix: "/officer", role: "officer" },
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const matched = protectedRoutes.find(({ prefix }) => pathname.startsWith(prefix))

  if (!matched) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = await verifySessionToken(token)

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session.role !== matched.role) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/customer/:path*", "/installer/:path*", "/officer/:path*"],
}
