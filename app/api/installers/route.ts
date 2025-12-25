import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth-server"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const installers = await prisma.user.findMany({
    where: { role: "installer" },
    include: { organization: true, packages: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(installers)
}
