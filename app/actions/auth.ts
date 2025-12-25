"use server"

import { loginUser, logoutUser, registerUser } from "@/lib/services/auth"

export async function loginAction(formData: { email: string; password: string }) {
  try {
    const user = await loginUser(formData)
    return { success: true, user }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in"
    return { success: false, error: message }
  }
}

export async function registerAction(formData: Record<string, unknown>) {
  try {
    const user = await registerUser(formData)
    return { success: true, user }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account"
    return { success: false, error: message }
  }
}

export async function logoutAction() {
  await logoutUser()
  return { success: true }
}
