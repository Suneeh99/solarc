"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  createSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth-server"

export async function loginAction(_: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = (formData.get("redirect") as string) || "/"

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: "Invalid credentials" }
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return { error: "Invalid credentials" }
  }

  await createSession(user.id, user.role)

  cookies().set("last_login_email", email, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  })

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

  const email = formData.get("email") as string
  const name = formData.get("name") as string

  if (!email || !name || !password) {
    return { error: "Missing required fields" }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "Email already registered" }
  }

  const passwordHash = await hashPassword(password)

  let organizationId: string | undefined

  if (role === "installer") {
    const org = await prisma.organization.create({
      data: {
        name:
          (formData.get("companyName") as string) || name,
        registrationNumber: formData.get(
          "registrationNumber",
        ) as string,
        description: formData.get("description") as string,
        phone: formData.get("phone") as string,
        address: formData.get("address") as string,
        verified: false,
      },
    })

    organizationId = org.id
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role as Role,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      organizationId,
      verified: role !== "installer",
    },
  })

  await createSession(user.id, user.role)

  redirect(
    role === "installer"
      ? "/installer/dashboard"
      : "/customer/dashboard",
  )
}
