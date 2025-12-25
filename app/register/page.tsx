"use client"

import type React from "react"

import { useState, useEffect, Suspense, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Sun, Eye, EyeOff, Upload, Building, User } from "lucide-react"
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "customer"

  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultRole)
  const [loading, startTransition] = useTransition()
  const [error, setError] = useState("")

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
        email: customerData.email,
        password: customerData.password,
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
      })

      if (!result.success || !result.user) {
        setError(result.error || "Unable to create account.")
        return
      }

      const user = result.user as SessionUser
      if (user.role === "customer") {
        router.push("/customer/dashboard")
      }
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
        email: installerData.email,
        password: installerData.password,
        name: installerData.companyName,
        phone: installerData.phone,
        address: installerData.address,
        companyName: installerData.companyName,
        registrationNumber: installerData.registrationNumber,
        description: installerData.description,
      })

      if (!result.success || !result.user) {
        setError(result.error || "Unable to create account.")
        return
      }

      const user = result.user as SessionUser
      if (user.role === "installer") {
        router.push("/installer/dashboard")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-foreground">
            CEB Solar
          </span>
        </Link>

        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">
              Create Account
            </CardTitle>
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

              <TabsContent value="customer">
                <form
                  onSubmit={handleCustomerSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={customerData.name}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={customerData.email}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={customerData.phone}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea
                      value={customerData.address}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          address: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={customerData.password}
                        onChange={(e) =>
                          setCustomerData({
                            ...customerData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
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
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    disabled={loading}
                  >
                    {loading
                      ? "Creating Account..."
                      : "Create Customer Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="installer">
                <form
                  onSubmit={handleInstallerSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Company Name</Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label>Registration Number</Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label>Phone</Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
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
                  </div>

                  <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600 text-sm">
                    Your account will be reviewed by a CEB officer before
                    activation.
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    disabled={loading}
                  >
                    {loading
                      ? "Creating Account..."
                      : "Create Installer Account"}
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
