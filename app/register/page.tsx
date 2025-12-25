"use client"

import type React from "react"

import { useState, useEffect, Suspense, useActionState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Sun, Eye, EyeOff, Upload, Building, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { registerAction } from "@/app/actions/auth"

function RegisterForm() {
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "customer"

  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultRole)
  const [state, formAction, pending] = useActionState(registerAction, null)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    if (state?.error) {
      setError(state.error)
    }
  }, [state])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-foreground">CEB Solar</span>
        </Link>

        <Card className="border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Create Account</CardTitle>
            <CardDescription>Register to start your solar journey</CardDescription>
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

              {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">{error}</div>}

              <TabsContent value="customer">
                <form action={formAction} className="space-y-4">
                  <input type="hidden" name="role" value="customer" />
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Full Name</Label>
                    <Input
                      id="customer-name"
                      placeholder="Enter your full name"
                      required
                      name="name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      name="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Phone Number</Label>
                    <Input
                      id="customer-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      required
                      name="phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-address">Address</Label>
                    <Textarea
                      id="customer-address"
                      placeholder="Enter your address"
                      required
                      name="address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="customer-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                      required
                      name="password"
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

                  <div className="space-y-2">
                    <Label htmlFor="customer-confirm-password">Confirm Password</Label>
                    <Input
                      id="customer-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      required
                      name="confirmPassword"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    disabled={pending}
                  >
                    {pending ? "Creating Account..." : "Create Customer Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="installer">
                <form action={formAction} className="space-y-4">
                  <input type="hidden" name="role" value="installer" />
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      placeholder="Enter company name"
                      required
                      name="companyName"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration-number">Business Registration Number</Label>
                    <Input
                      id="registration-number"
                      placeholder="Enter registration number"
                      required
                      name="registrationNumber"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="installer-email">Email</Label>
                    <Input
                      id="installer-email"
                      type="email"
                      placeholder="Enter company email"
                      required
                      name="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="installer-phone">Phone Number</Label>
                    <Input
                      id="installer-phone"
                      type="tel"
                      placeholder="Enter contact number"
                      required
                      name="phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="installer-address">Business Address</Label>
                    <Textarea
                      id="installer-address"
                      placeholder="Enter business address"
                      required
                      name="address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="installer-description">Company Description</Label>
                    <Textarea
                      id="installer-description"
                      placeholder="Describe your company and services"
                      required
                      name="description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Company Documents</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Upload registration certificate, licenses, and other documents
                      </p>
                      <input type="file" className="hidden" id="documents" multiple accept=".pdf,.jpg,.png" />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 bg-transparent"
                        onClick={() => document.getElementById("documents")?.click()}
                      >
                        Select Files
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="installer-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="installer-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                      required
                      name="password"
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

                  <div className="space-y-2">
                    <Label htmlFor="installer-confirm-password">Confirm Password</Label>
                    <Input
                      id="installer-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      required
                      name="confirmPassword"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600 text-sm">
                    Note: Your account will need to be verified by a CEB officer before you can receive customer orders.
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    disabled={pending}
                  >
                    {pending ? "Creating Account..." : "Create Installer Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-500 hover:text-emerald-600 font-medium">
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
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
