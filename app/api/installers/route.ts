import { NextResponse } from "next/server"

import { getInstallers, updateInstallerStatus } from "@/lib/data"

export async function GET() {
  return NextResponse.json({ installers: getInstallers() })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { installerId, action, reason, documentLinks } = body

    if (!installerId || !action) {
      return NextResponse.json({ error: "installerId and action are required" }, { status: 400 })
    }

    if (!["approve", "reject", "suspend"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const installer = updateInstallerStatus(installerId, action, {
      reason,
      documentLinks,
    })

    return NextResponse.json({ installer })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
