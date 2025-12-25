export * from "./types"
import type { Application, Installer, User } from "./types"
import { getApplications, getInstallers } from "./data-store"

export function getUser(): User | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem("user")
  window.location.href = "/login"
}

// Demo data helpers
export function getDemoApplications(): Application[] {
  return getApplications()
}

export function getDemoInstallers(): Installer[] {
  return getInstallers()
}
