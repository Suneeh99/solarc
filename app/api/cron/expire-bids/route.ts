import { NextResponse } from "next/server"
import { expireStaleBids } from "@/lib/data-store"

export async function POST() {
  const result = expireStaleBids()
  return NextResponse.json(result)
}

export const GET = POST
