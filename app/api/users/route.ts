import { NextResponse } from "next/server"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSessionUser, requireRole } from "@/lib/auth-server"

export async function GET() {
  const user = await getSessionUser()
  const forbidden = user ? requireRole(user.role, [Role.officer]) : NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (forbidden) return forbidden

  const users = await prisma.user.findMany({
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(users)
}
