import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { EmailConflictError, createUserAccount } from "@/lib/data-store"
import { registerSchema } from "@/lib/validations/auth"
import { attachSessionCookie, createSessionToken } from "@/lib/session"
import type { User } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = registerSchema.parse(json)

    const { role, email, password, phone, address } = parsed

    const { user, organization } = await createUserAccount({
      role,
      email,
      name: role === "installer" ? parsed.companyName : parsed.name,
      password,
      phone,
      address,
      organization:
        role === "installer"
          ? {
              name: parsed.companyName,
              registrationNumber: parsed.registrationNumber,
              email,
              phone,
              address,
              description: parsed.description,
            }
          : undefined,
    })

    const response = NextResponse.json({ user, organization })
    const token = await createSessionToken(user as User)
    attachSessionCookie(response, token)

    return response
  } catch (error) {
    if (error instanceof EmailConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten() },
        { status: 400 },
      )
    }

    console.error("[REGISTER_ERROR]", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
