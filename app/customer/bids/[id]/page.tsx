"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Clock, CheckCircle, Building2, Phone, Mail, Award, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Bid, BidSession } from "@/lib/auth"

export default function BidSessionDetail() {
  const params = useParams()
  const [session, setSession] = useState<BidSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)
  const [decision, setDecision] = useState<"accept" | "reject" | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 60)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const res = await fetch(`/api/bids/${params.id}`)
        if (!res.ok) throw new Error("Unable to load bid session")
        const data = await res.json()
        setSession(data)
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Unexpected error")
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [params.id])

  const countdown = useMemo(() => {
    if (!session) return "—"
    const diff = new Date(session.expiresAt).getTime() - now.getTime()
    if (diff <= 0) return "Expired"
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return days > 0 ? `${days}d ${remainingHours}h left` : `${hours}h ${minutes}m left`
  }, [now, session])

  const sortedBids = useMemo(() => {
    return session ? [...session.bids].sort((a, b) => a.price - b.price) : []
  }, [session])

  const lowestPrice = sortedBids[0]?.price
  const highestRated = useMemo(() => {
    return session ? [...session.bids].sort((a, b) => (b.installerRating ?? 0) - (a.installerRating ?? 0))[0] : null
  }, [session])

  const activeSelectedBid = useMemo(() => {
    if (!session?.selectedBidId) return null
    return session.bids.find((bid) => bid.id === session.selectedBidId) ?? null
  }, [session])

  const sessionStatusBadge = (status: BidSession["status"]) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Open
          </Badge>
        )
      case "closed":
        return (
          <Badge className="bg-blue-500/10 text-blue-600" variant="secondary">
            <CheckCircle className="w-3 h-3 mr-1" />
            Closed
          </Badge>
        )
      case "expired":
        return (
          <Badge className="bg-red-500/10 text-red-600" variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        )
    }
  }

  const handleDecision = async () => {
    if (!session || !selectedBid || !decision) return
    setActionLoading(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/bids/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: decision, bidId: selectedBid.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Unable to update bid")
      setSession(data)
      setSelectedBid(null)
      setDecision(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading bid session...
        </div>
      </DashboardLayout>
    )
  }

  if (loadError || !session) {
    return (
      <DashboardLayout>
        <div className="space-y-3">
          <Link href="/customer/bids">
            <Button variant="ghost" size="sm" className="bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to bids
            </Button>
          </Link>
          <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
            {loadError || "Bid session not found"}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/customer/bids">
            <Button variant="ghost" size="icon" className="bg-transparent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{session.id}</h1>
              {sessionStatusBadge(session.status)}
              <Badge variant="outline" className="text-xs">
                {session.bidType === "open" ? "Open Bid" : "Specific Installer"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {session.applicationDetails?.address ?? "No address"} | {session.applicationDetails?.capacity ?? "N/A"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bids</p>
                  <p className="text-xl font-bold text-foreground">{session.bids.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lowest Bid</p>
                  <p className="text-xl font-bold text-emerald-500">
                    {lowestPrice ? `LKR ${lowestPrice.toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="text-xl font-bold text-foreground">
                    {new Date(session.expiresAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {session.status === "open" && <p className="text-xs text-amber-500">{countdown}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {activeSelectedBid && (
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-foreground">Selected Bid</CardTitle>
              <CardDescription>Application status will track the accepted installer.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">{activeSelectedBid.installerName}</p>
                <p className="text-sm text-muted-foreground">
                  {activeSelectedBid.packageName ?? "Custom Package"} • {activeSelectedBid.estimatedDays} days •{" "}
                  {activeSelectedBid.warranty} warranty
                </p>
              </div>
              <p className="font-bold text-emerald-600">LKR {activeSelectedBid.price.toLocaleString()}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Received Bids</CardTitle>
            <CardDescription>
              Compare quotes from verified installers and accept or reject to update your application status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {actionError && (
              <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
                {actionError}
              </div>
            )}
            {sortedBids.map((bid) => (
              <div
                key={bid.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedBid?.id === bid.id
                    ? "border-emerald-500 bg-emerald-500/5"
                    : "border-border hover:border-emerald-500/30"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{bid.installerName}</p>
                        {bid.price === lowestPrice && (
                          <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
                            Lowest Price
                          </Badge>
                        )}
                        {highestRated?.id === bid.id && (
                          <Badge className="bg-amber-500/10 text-amber-600" variant="secondary">
                            Top Rated
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs capitalize">
                          {bid.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {bid.installerRating ?? "N/A"}
                        </span>
                        <span>{bid.completedProjects ?? 0} projects</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{bid.packageName ?? "Custom proposal"}</p>
                      <p className="text-sm text-muted-foreground mt-1">{bid.proposal}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="font-bold text-emerald-500">LKR {bid.price.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Warranty</p>
                        <p className="font-medium text-foreground">{bid.warranty}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Timeline</p>
                        <p className="font-medium text-foreground">{bid.estimatedDays} days</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="bg-transparent"
                        disabled={session.status !== "open" || bid.status !== "pending" || actionLoading}
                        onClick={() => {
                          setSelectedBid(bid)
                          setDecision("reject")
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedBid(bid)
                          setDecision("accept")
                        }}
                        disabled={session.status !== "open" || bid.status !== "pending" || actionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {decision && selectedBid && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-foreground">
                  {decision === "accept" ? "Confirm Bid Acceptance" : "Reject Bid"}
                </CardTitle>
                <CardDescription>
                  {decision === "accept"
                    ? "Accepting will close the session and move your application forward."
                    : "Reject this proposal and keep the session open for other bids."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-semibold text-foreground">{selectedBid.installerName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Package</p>
                      <p className="text-foreground">{selectedBid.packageName ?? "Custom proposal"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="font-bold text-emerald-500">LKR {selectedBid.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Warranty</p>
                      <p className="text-foreground">{selectedBid.warranty}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Timeline</p>
                      <p className="text-foreground">{selectedBid.estimatedDays} days</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-cyan-500/10 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">Installer Contact</p>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {selectedBid.contact?.phone ?? "N/A"}
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {selectedBid.contact?.email ?? "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDecision(null)
                      setSelectedBid(null)
                    }}
                    className="flex-1 bg-transparent"
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleDecision} className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={actionLoading}>
                    {actionLoading ? "Processing..." : decision === "accept" ? "Confirm" : "Reject Bid"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
