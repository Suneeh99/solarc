"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { createSession, hashPassword, verifyPassword } from "@/lib/auth-server"

export async function loginAction(_: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = (formData.get("redirect") as string) || "/"

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: "Invalid credentials" }
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return { error: "Invalid credentials" }
  }

  await createSession(user.id, user.role)
  cookies().set("last_login_email", email, { httpOnly: false, sameSite: "lax", path: "/" })
  redirect(redirectTo)
}

export async function registerAction(_: unknown, formData: FormData) {
  const role = (formData.get("role") as string) || "customer"
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (!Object.values(Role).includes(role as Role)) {
    return { error: "Invalid role" }
  }

  const payload: Record<string, unknown> = {
    role: role as Role,
    name: formData.get("name"),
    email: formData.get("email"),
    password,
    phone: formData.get("phone"),
    address: formData.get("address"),
  }

  if (role === "installer") {
    payload.companyName = formData.get("companyName")
    payload.registrationNumber = formData.get("registrationNumber")
    payload.description = formData.get("description")
  }

  const existing = await prisma.user.findUnique({ where: { email: payload.email as string } })
  if (existing) {
    return { error: "Email already registered" }
  }

  const passwordHash = await hashPassword(password)

  let organizationId: string | undefined
  if (role === "installer") {
    const org = await prisma.organization.create({
      data: {
        name: (payload.companyName as string) || (payload.name as string),
        registrationNumber: payload.registrationNumber as string,
        description: payload.description as string,
        phone: payload.phone as string,
        address: payload.address as string,
        verified: false,
      },
    })
    organizationId = org.id
  }

  const user = await prisma.user.create({
    data: {
      name: payload.name as string,
      email: payload.email as string,
      passwordHash,
      role: payload.role as Role,
      phone: payload.phone as string,
      address: payload.address as string,
      organizationId,
      verified: role !== "installer",
    },
  })

  await createSession(user.id, user.role)

  const redirectTo = role === "installer" ? "/installer/dashboard" : "/customer/dashboard"
  redirect(redirectTo)
}
