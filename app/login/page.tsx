"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sun, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginSchema } from "@/lib/validations/auth"
import { useAuthSession } from "@/hooks/use-auth-session"

export default function LoginPage() {
  const router = useRouter()
  const { user, status, refresh } = useAuthSession()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(`/${user.role}/dashboard`)
    }
  }, [router, status, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const parsed = loginSchema.safeParse(formData)
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid credentials")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error ?? "Unable to sign in with those credentials.")
        setLoading(false)
        return
      }

      await refresh()
      setLoading(false)
      router.replace(`/${result.user.role}/dashboard`)
    } catch (err) {
      console.error("[LOGIN_ERROR]", err)
      setError("Unexpected error while signing in. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-foreground">CEB Solar</span>
        </Link>

        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link href="/register" className="text-emerald-500 hover:text-emerald-600 font-medium">
                  Register
                </Link>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-2 text-foreground">Demo Accounts:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Customer: customer@demo.com</li>
                  <li>Installer: installer@demo.com</li>
                  <li>Officer: officer@demo.com</li>
                </ul>
                <p className="mt-2 text-xs">Use password: <span className="font-semibold">password123</span></p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
