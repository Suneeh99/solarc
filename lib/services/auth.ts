import "server-only"

import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { clearSession, createSession, getCurrentUser, serializeUser } from "@/lib/session"

const registerSchema = z.object({
  role: z.enum(["customer", "installer"]),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  companyName: z.string().optional(),
  registrationNumber: z.string().optional(),
  description: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type PublicUser = ReturnType<typeof serializeUser>

export async function registerUser(input: unknown) {
  const data = registerSchema.parse(input)

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    throw new Error("An account with this email already exists")
  }

  const passwordHash = await bcrypt.hash(data.password, 10)

  let organizationId: string | undefined
  if (data.role === "installer") {
    const organization = await prisma.organization.create({
      data: {
        name: data.companyName || `${data.name}'s Solar`,
        registrationNumber: data.registrationNumber,
        description: data.description,
        verified: false,
      },
    })
    organizationId = organization.id
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      role: data.role,
      phone: data.phone,
      address: data.address,
      passwordHash,
      organizationId,
      verified: data.role === "customer",
    },
    include: { organization: { select: { id: true, name: true } } },
  })

  await createSession(user.id)

  return serializeUser(user)
}

export async function loginUser(input: unknown) {
  const data = loginSchema.parse(input)

  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { organization: { select: { id: true, name: true } } },
  })

  if (!user) {
    throw new Error("Invalid credentials")
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash)
  if (!isValid) {
    throw new Error("Invalid credentials")
  }

  await createSession(user.id)
  return serializeUser(user)
}

export async function logoutUser() {
  await clearSession()
}

export async function currentUser() {
  return getCurrentUser()
}
