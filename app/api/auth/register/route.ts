import { NextResponse } from "next/server"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { createSession, hashPassword } from "@/lib/auth-server"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      companyName,
      registrationNumber,
      description,
    } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    if (!Object.values(Role).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 },
      )
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      )
    }

    const passwordHash = await hashPassword(password)

    let organizationId: string | undefined

    if (role === Role.installer) {
      const organization = await prisma.organization.create({
        data: {
          name: companyName || name,
          registrationNumber,
          description,
          phone,
          address,
          verified: false,
        },
      })

      organizationId = organization.id
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        phone,
        address,
        organizationId,
        verified: role !== Role.installer,
      },
    })

    await createSession(user.id, user.role)

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 },
    )
  }
}
