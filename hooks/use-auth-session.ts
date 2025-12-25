"use client"

import { useCallback, useEffect, useState } from "react"
import type { User } from "@/lib/auth"

type SessionStatus = "loading" | "authenticated" | "unauthenticated"

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<SessionStatus>("loading")

  const refresh = useCallback(async () => {
    setStatus("loading")
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" })
      if (!response.ok) {
        setUser(null)
        setStatus("unauthenticated")
        return
      }

      const data = await response.json()
      setUser(data.user)
      setStatus("authenticated")
    } catch (error) {
      console.error("[SESSION_ERROR]", error)
      setUser(null)
      setStatus("unauthenticated")
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { user, status, refresh }
}
