"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gavel, Clock, CheckCircle, XCircle, Plus, ArrowRight, Timer, Loader2 } from "lucide-react"
import { getUser, type BidSession, type User } from "@/lib/auth"

export default function CustomerBids() {
  const [user, setUser] = useState<User | null>(null)
  const [bidSessions, setBidSessions] = useState<BidSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    setUser(getUser())
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 60)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!user) return
    const customerId = user.id ?? "CUST-001"

    const fetchSessions = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/bids?customerId=${customerId}`)
        if (!res.ok) throw new Error("Failed to load bid sessions")
        const data = await res.json()
        setBidSessions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error")
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [user])

  const getStatusBadge = (status: BidSession["status"]) => {
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

  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - now.getTime()
    if (diff <= 0) return "Expired"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24

    if (days > 0) {
      return `${days}d ${remainingHours}h remaining`
    }
    return `${hours}h ${minutes}m remaining`
  }

  const enrichedSessions = useMemo(() => {
    return bidSessions.map((session) => {
      const selectedBid = session.selectedBidId
        ? session.bids.find((bid) => bid.id === session.selectedBidId)
        : undefined
      return { ...session, selectedBid }
    })
  }, [bidSessions])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Bids</h1>
            <p className="text-muted-foreground">Manage your bid sessions and view installer proposals</p>
          </div>
          <Link href="/customer/bids/new">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Open New Bid
            </Button>
          </Link>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Timer className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">How Bidding Works</p>
                <p className="text-muted-foreground">
                  When you open a bid, installers have 48 hours to submit proposals. Accept a bid to move the linked
                  application into installation, or let it expire to choose packages directly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bid Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Bid Sessions ({enrichedSessions.length})</CardTitle>
            <CardDescription>View and manage your active and past bid sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading bid sessions...
              </div>
            ) : error ? (
              <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            ) : enrichedSessions.length === 0 ? (
              <div className="text-center py-12">
                <Gavel className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No bid sessions yet</h3>
                <p className="text-muted-foreground mb-4">Open a bid to receive proposals from verified installers</p>
                <Link href="/customer/bids/new">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Open New Bid
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {enrichedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Gavel className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{session.id}</p>
                          {getStatusBadge(session.status)}
                          <Badge variant="outline" className="text-xs">
                            {session.bidType === "open" ? "Open Bid" : "Specific Installer"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Application: {session.applicationId} • {session.bids.length} bids received
                        </p>
                        {session.applicationDetails?.address && (
                          <p className="text-xs text-muted-foreground">{session.applicationDetails.address}</p>
                        )}
                        {session.status === "open" && (
                          <p className="text-xs text-amber-500 mt-1">{getTimeRemaining(session.expiresAt)}</p>
                        )}
                        {session.selectedBid && (
                          <p className="text-xs text-emerald-500 mt-1">
                            Selected: {session.selectedBid.installerName} - Rs.{" "}
                            {session.selectedBid.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link href={`/customer/bids/${session.id}`}>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        View Bids
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
