"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Clock, Users, Zap, Info, ShieldAlert } from "lucide-react"
import Link from "next/link"
import type { Application } from "@/lib/auth"

export default function NewBidSession() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const preSelectedApp = searchParams.get("application") || ""
  const preSelectedInstaller = searchParams.get("installer") || ""
  const preSelectedPackage = searchParams.get("package") || ""

  const [approvedApplications, setApprovedApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState(preSelectedApp)
  const [bidDuration, setBidDuration] = useState("7")
  const [maxBudget, setMaxBudget] = useState("")
  const [requirements, setRequirements] = useState(
    preSelectedPackage ? `Interested in package: ${preSelectedPackage}` : "",
  )
  const [bidType, setBidType] = useState<"open" | "specific">(preSelectedInstaller ? "specific" : "open")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchApproved = async () => {
      const res = await fetch("/api/customer/applications/approved")
      const data = await res.json()
      setApprovedApplications(data.applications)
    }
    fetchApproved()
  }, [])

  const hasApproved = useMemo(() => approvedApplications.length > 0, [approvedApplications])

  const handleCreateBidSession = () => {
    if (!selectedApplication) {
      alert("Please select an application first")
      return
    }

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      alert("Bid session created successfully! Installers will be notified.")
      router.push("/customer/bids")
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/customer/bids">
            <Button variant="ghost" size="icon" className="bg-transparent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Bid Session</h1>
            <p className="text-muted-foreground">Request quotes from verified installers</p>
          </div>
        </div>

        {!hasApproved && (
          <Card className="border-amber-500/40 bg-amber-500/10">
            <CardContent className="p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Approval required</p>
                <p className="text-sm text-muted-foreground">
                  You need an approved application before opening a bid session or requesting quotes.
                </p>
                <div className="mt-2 flex gap-2">
                  <Link href="/customer/applications/new">
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      Submit application
                    </Button>
                  </Link>
                  <Link href="/customer/applications">
                    <Button size="sm" variant="outline" className="bg-transparent">
                      Track applications
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bid Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Bid Type</CardTitle>
            <CardDescription>Choose how you want to receive quotes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setBidType("open")}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  bidType === "open"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-border hover:border-emerald-500/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-foreground">Open Bid</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  All verified installers can submit quotes. Best for getting multiple competitive offers.
                </p>
              </div>
              <div
                onClick={() => setBidType("specific")}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  bidType === "specific"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-border hover:border-emerald-500/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-foreground">Specific Installer</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Request a quote from a specific installer. Best when you already know who you want.
                </p>
              </div>
            </div>

            {preSelectedInstaller && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                  <p className="text-sm text-blue-600">
                    Pre-selected installer: <strong>{preSelectedInstaller}</strong>
                    {preSelectedPackage && <span> - Package: {preSelectedPackage}</span>}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Select Application */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Select Application</CardTitle>
            <CardDescription>Choose an approved application for the bid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvedApplications.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">You need an approved application to open a bid session.</p>
                <Link href="/customer/applications/new">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Submit New Application</Button>
                </Link>
              </div>
            ) : (
              approvedApplications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApplication(app.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedApplication === app.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border hover:border-emerald-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{app.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {app.technicalDetails.roofType} • {app.technicalDetails.monthlyConsumption}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-emerald-500">{app.status}</p>
                      <p className="text-xs text-muted-foreground">
                        Reviewed {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Bid Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Bid Settings</CardTitle>
            <CardDescription>Configure your bidding preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Bid Duration (Days)
              </Label>
              <Select value={bidDuration} onValueChange={setBidDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="5">5 Days</SelectItem>
                  <SelectItem value="7">7 Days (Recommended)</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Maximum Budget (LKR) - Optional
              </Label>
              <Input
                type="number"
                placeholder="e.g., 1500000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Special Requirements
              </Label>
              <Textarea
                placeholder="Describe project needs, roof condition, timing, or preferred equipment..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">How Bidding Works</p>
                <p className="text-muted-foreground">
                  When you open a bid, installers have 48 hours to submit their proposals. You can review and select the
                  best offer. If no bid is selected within 48 hours, the bid expires and you can browse packages
                  directly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link href="/customer/bids" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleCreateBidSession}
            disabled={!selectedApplication || loading || !hasApproved}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white"
            title={hasApproved ? undefined : "Application approval required before opening bids"}
          >
            {loading ? "Creating..." : "Create Bid Session"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
