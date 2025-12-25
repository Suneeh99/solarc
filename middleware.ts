import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

type Role = "customer" | "installer" | "officer"

const protectedRoutes = [
  { prefix: "/customer", roles: [Role.customer] },
  { prefix: "/installer", roles: [Role.installer] },
  { prefix: "/officer", roles: [Role.officer] },
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const match = protectedRoutes.find((route) => pathname.startsWith(route.prefix))
  if (!match) return NextResponse.next()

  const token = req.cookies.get("session_token")?.value
  const secret = process.env.JWT_SECRET
  if (!token || !secret) {
    const url = new URL("/login", req.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  let role: Role | null = null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    role = (payload as { role?: Role }).role ?? null
  } catch {
    const url = new URL("/login", req.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (!role) {
    const url = new URL("/login", req.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (!match.roles.includes(role)) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/customer/:path*", "/installer/:path*", "/officer/:path*"],
}
