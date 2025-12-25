"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MapPin, Zap, Calendar, Clock, Send, Package, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getDemoInstallers, getUser, type BidSession, type SolarPackage, type User } from "@/lib/auth"

export default function SubmitBidPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<BidSession | null>(null)
  const [selectedPackage, setSelectedPackage] = useState("")
  const [customPrice, setCustomPrice] = useState("")
  const [timeline, setTimeline] = useState("14")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setUser(getUser())
  }, [])

  useEffect(() => {
    const fetchSession = async () => {
      setError(null)
      try {
        const res = await fetch(`/api/bids/${params.id}`)
        if (!res.ok) throw new Error("Unable to load bid request")
        const data = await res.json()
        setSession(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error")
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [params.id])

  const installerPackages = useMemo<SolarPackage[]>(() => {
    const installer = getDemoInstallers().find((inst) => inst.id === (user?.id ?? "INS-001"))
    return installer?.packages ?? []
  }, [user])

  const selectedPkg = installerPackages.find((p) => p.id === selectedPackage)

  const handleSubmitBid = async () => {
    if (!session || (!customPrice && !selectedPkg?.price)) {
      setError("Please select a package or enter a price.")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/bids/${session.id}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          installerId: user?.id ?? "INS-001",
          installerName: user?.name ?? "Installer",
          price: Number(customPrice || selectedPkg?.price),
          proposal: selectedPkg?.name ?? "Custom bid",
          warranty: selectedPkg?.warranty ?? "Standard warranty",
          estimatedDays: Number(timeline),
          packageName: selectedPkg?.name,
          contact: { email: user?.email, phone: "N/A" },
          message: notes,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Unable to submit bid")
      }

      router.push("/installer/bids")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading bid request...
        </div>
      </DashboardLayout>
    )
  }

  if (error || !session) {
    return (
      <DashboardLayout>
        <div className="space-y-3">
          <Link href="/installer/bids">
            <Button variant="ghost" size="sm" className="bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to bids
            </Button>
          </Link>
          <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
            {error || "Bid request not found"}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/installer/bids">
            <Button variant="ghost" size="icon" className="bg-transparent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Submit Bid</h1>
            <p className="text-muted-foreground">Bid Request {session.id}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Project Details</CardTitle>
                <CardDescription>Customer requirements for this installation</CardDescription>
              </div>
              <Badge
                className={session.status === "open" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-foreground"}
                variant="secondary"
              >
                <Clock className="w-3 h-3 mr-1" />
                Expires {new Date(session.expiresAt).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">
                      {session.applicationDetails?.address ?? "Address not available"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Desired Capacity</p>
                    <p className="font-medium text-foreground">{session.applicationDetails?.capacity ?? "N/A"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bid Type</p>
                  <p className="font-medium text-foreground" data-testid="bid-type">
                    {session.bidType === "open" ? "Open (all installers)" : "Specific installer request"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requirements</p>
                  <p className="font-medium text-foreground">{session.requirements ?? "No extra requirements"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Select Package</CardTitle>
            <CardDescription>Choose one of your packages for this bid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {installerPackages.length === 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                No packages available. Add packages to submit a proposal.
              </div>
            )}
            {installerPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => {
                  setSelectedPackage(pkg.id)
                  setCustomPrice("")
                }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedPackage === pkg.id
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-border hover:border-emerald-500/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{pkg.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pkg.capacity} • {pkg.panelType} panels
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{pkg.warranty} warranty</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-500">LKR {pkg.price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{pkg.capacity}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Bid Details</CardTitle>
            <CardDescription>Customize your offer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="price">Custom Price (LKR) - Optional</Label>
              <Input
                id="price"
                type="number"
                placeholder={
                  selectedPkg ? `Package price: ${selectedPkg.price.toLocaleString()}` : "Select a package first"
                }
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">Leave empty to use the package price</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Installation Timeline (Days)
              </Label>
              <select
                id="timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="7">7 Days</option>
                <option value="10">10 Days</option>
                <option value="14">14 Days</option>
                <option value="21">21 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-24 p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Any additional information or special offers..."
              />
            </div>
          </CardContent>
        </Card>

        {selectedPackage && (
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Bid Summary</p>
                  <p className="font-semibold text-foreground">{selectedPkg?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p className="text-xl font-bold text-emerald-500">
                    LKR {(Number(customPrice) || selectedPkg?.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Link href="/installer/bids" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmitBid}
            disabled={!selectedPackage || submitting || session.status !== "open"}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Bid
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
