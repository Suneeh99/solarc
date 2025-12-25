"use client"

import type React from "react"
import { useState, useEffect, Suspense, useTransition } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Sun, Eye, EyeOff, Building, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import { registerAction } from "@/app/actions/auth"
import type { User as SessionUser } from "@/lib/auth"

function RegisterForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const defaultRole = searchParams.get("role") || "customer"

  const [activeTab, setActiveTab] = useState(defaultRole)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, startTransition] = useTransition()

  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  })

  const [installerData, setInstallerData] = useState({
    companyName: "",
    registrationNumber: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    setActiveTab(defaultRole)
  }, [defaultRole])

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (customerData.password !== customerData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    startTransition(async () => {
      const result = await registerAction({
        role: "customer",
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        password: customerData.password,
      })

      if (!result.success || !result.user) {
        setError(result.error || "Unable to create account.")
        return
      }

      const user = result.user as SessionUser
      router.push("/customer/dashboard")
    })
  }

  const handleInstallerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (installerData.password !== installerData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    startTransition(async () => {
      const result = await registerAction({
        role: "installer",
        name: installerData.companyName,
        companyName: installerData.companyName,
        registrationNumber: installerData.registrationNumber,
        description: installerData.description,
        email: installerData.email,
        phone: installerData.phone,
        address: installerData.address,
        password: installerData.password,
      })

      if (!result.success || !result.user) {
        setError(result.error || "Unable to create account.")
        return
      }

      router.push("/installer/dashboard")
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-foreground">
            CEB Solar
          </span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Register to start your solar journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="customer" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer
                </TabsTrigger>
                <TabsTrigger value="installer" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Installer
                </TabsTrigger>
              </TabsList>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Customer */}
              <TabsContent value="customer">
                <form onSubmit={handleCustomerSubmit} className="space-y-4">
                  <Field label="Full Name">
                    <Input
                      value={customerData.name}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, name: e.target.value })
                      }
                      required
                    />
                  </Field>

                  <Field label="Email">
                    <Input
                      type="email"
                      value={customerData.email}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, email: e.target.value })
                      }
                      required
                    />
                  </Field>

                  <Field label="Phone">
                    <Input
                      value={customerData.phone}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, phone: e.target.value })
                      }
                      required
                    />
                  </Field>

                  <Field label="Address">
                    <Textarea
                      value={customerData.address}
                      onChange={(e) =>
                        setCustomerData({ ...customerData, address: e.target.value })
                      }
                      required
                    />
                  </Field>

                  <PasswordField
                    label="Password"
                    value={customerData.password}
                    onChange={(v) =>
                      setCustomerData({ ...customerData, password: v })
                    }
                    show={showPassword}
                    toggle={() => setShowPassword((p) => !p)}
                  />

                  <Field label="Confirm Password">
                    <Input
                      type="password"
                      value={customerData.confirmPassword}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </Field>

                  <Button className="w-full bg-emerald-500 text-white" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Customer Account"}
                  </Button>
                </form>
              </TabsContent>

              {/* Installer */}
              <TabsContent value="installer">
                <form onSubmit={handleInstallerSubmit} className="space-y-4">
                  <Field label="Company Name">
                    <Input
                      value={installerData.companyName}
                      onChange={(e) =>
                        setInstallerData({
                          ...installerData,
                          companyName: e.target.value,
                        })
                      }
                      required
                    />
                  </Field>

                  <Field label="Registration Number">
                    <Input
                      value={installerData.registrationNumber}
                      onChange={(e) =>
                        setInstallerData({
                          ...installerData,
                          registrationNumber: e.target.value,
                        })
                      }
                      required
                    />
                  </Field>

                  <Field label="Email">
                    <Input
                      type="email"
                      value={installerData.email}
                      onChange={(e) =>
                        setInstallerData({
                          ...installerData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </Field>

                  <Field label="Phone">
                    <Input
                      value={installerData.phone}
                      onChange={(e) =>
                        setInstallerData({
                          ...installerData,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                  </Field>

                  <Field label="Address">
                    <Textarea
                      value={installerData.address}
                      onChange={(e) =>
                        setInstallerData({
                          ...installerData,
                          address: e.target.value,
                        })
                      }
                      required
                    />
                  </Field>

                  <Field label="Description">
                    <Textarea
                      value={installerData.description}
                      onChange={(e) =>
                        setInstallerData({
                          ...installerData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </Field>

                  <Field label="Password">
                    <Input
                      type="password"
                      value={installerData.password}
                      onChange={(e) =>
                        setInstallerData({
                          ...installerData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </Field>

                  <Field label="Confirm Password">
                    <Input
                      type="password"
                      value={installerData.confirmPassword}
                      onChange={(e) =>
                        setInstallerData({
                          ...installerData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </Field>

                  <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600 text-sm">
                    Your account will be reviewed by a CEB officer before activation.
                  </div>

                  <Button className="w-full bg-emerald-500 text-white" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Installer Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-emerald-500 hover:text-emerald-600 font-medium"
              >
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  toggle,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  toggle: () => void
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Loading...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
