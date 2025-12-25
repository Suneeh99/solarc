import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session"

const protectedRoutes: Array<{ prefix: string; role: "customer" | "installer" | "officer" }> = [
  { prefix: "/customer", role: "customer" },
  { prefix: "/installer", role: "installer" },
  { prefix: "/officer", role: "officer" },
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const matched = protectedRoutes.find(({ prefix }) =>
    pathname.startsWith(prefix),
  )

  if (!matched) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = token ? await verifySessionToken(token) : null

  if (!session) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (session.role !== matched.role) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/customer/:path*", "/installer/:path*", "/officer/:path*"],
}
