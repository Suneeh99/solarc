"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Zap,
  Info,
  Loader2,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  fetchCurrentUser,
  fetchApplications,
  type Application,
  type User,
} from "@/lib/auth"

export default function NewBidSession() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const preSelectedApp = searchParams.get("application") || ""
  const preSelectedInstaller = searchParams.get("installer") || ""
  const preSelectedPackage = searchParams.get("package") || ""

  const [user, setUser] = useState<User | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState(preSelectedApp)

  const [bidType, setBidType] = useState<"open" | "specific">(
    preSelectedInstaller ? "specific" : "open",
  )
  const [bidDuration, setBidDuration] = useState("2")
  const [maxBudget, setMaxBudget] = useState("")
  const [requirements, setRequirements] = useState(
    preSelectedPackage ? `Interested in package: ${preSelectedPackage}` : "",
  )

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const currentUser = await fetchCurrentUser()
        if (!currentUser) {
          router.push("/login")
          return
        }
        setUser(currentUser)

        const apps = await fetchApplications()
        const approved = apps.filter(
          (a) =>
            a.customerId === currentUser.id &&
            ["approved", "payment_confirmed", "finding_installer"].includes(a.status),
        )

        setApplications(approved)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load applications")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  async function handleCreateBidSession() {
    if (!selectedApplication || !user) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApplication,
          customerId: user.id,
          durationHours: Number(bidDuration) * 24,
          maxBudget: maxBudget ? Number(maxBudget) : undefined,
          requirements,
          bidType,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Unable to create bid session")
      }

      router.push("/customer/bids")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/customer/bids">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Create Bid Session
            </h1>
            <p className="text-muted-foreground">
              Request quotes from verified installers
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Bid Type */}
        <Card>
          <CardHeader>
            <CardTitle>Bid Type</CardTitle>
            <CardDescription>
              Choose how you want to receive quotes
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setBidType("open")}
              className={`p-4 rounded-lg border-2 cursor-pointer ${
                bidType === "open"
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-border hover:border-emerald-500/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-emerald-500" />
                <span className="font-medium">Open Bid</span>
              </div>
              <p className="text-sm text-muted-foreground">
                All verified installers can submit quotes.
              </p>
            </div>

            <div
              onClick={() => setBidType("specific")}
              className={`p-4 rounded-lg border-2 cursor-pointer ${
                bidType === "specific"
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-border hover:border-emerald-500/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Specific Installer</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Request a quote from a known installer.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Application Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Application</CardTitle>
            <CardDescription>
              Choose an approved application
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading applications...
              </div>
            ) : applications.length === 0 ? (
              <p className="text-muted-foreground">
                No approved applications available.
              </p>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApplication(app.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer ${
                      selectedApplication === app.id
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-border hover:border-emerald-500/50"
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {app.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {app.customerName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-emerald-600 capitalize">
                          {app.status.replace("_", " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Updated{" "}
                          {new Date(app.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bid Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Bid Settings</CardTitle>
            <CardDescription>
              Configure your preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Bid Duration
              </Label>
              <Select value={bidDuration} onValueChange={setBidDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Days</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="5">5 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Maximum Budget (Optional)</Label>
              <Input
                type="number"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="e.g. 1500000"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Special Requirements
              </Label>
              <Textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Project details, preferences, timing..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  How bidding works
                </p>
                <p className="text-muted-foreground">
                  Installers can submit proposals until the bid window closes.
                  You can review offers and accept the best one, or let the bid
                  expire and browse packages directly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/customer/bids" className="flex-1">
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleCreateBidSession}
            disabled={!selectedApplication || submitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {submitting ? "Creating..." : "Create Bid Session"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
