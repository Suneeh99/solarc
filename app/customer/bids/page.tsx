"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gavel, Clock, CheckCircle, XCircle, Plus, ArrowRight, Timer } from "lucide-react"

// Demo bid sessions
const demoBidSessions = [
  {
    id: "BID-001",
    applicationId: "APP-001",
    startedAt: "2024-01-20T10:00:00Z",
    expiresAt: "2024-01-22T10:00:00Z",
    status: "open" as const,
    bidsCount: 3,
  },
  {
    id: "BID-002",
    applicationId: "APP-002",
    startedAt: "2024-01-15T08:00:00Z",
    expiresAt: "2024-01-17T08:00:00Z",
    status: "closed" as const,
    bidsCount: 5,
    selectedBid: {
      installerName: "Solar Pro Ltd",
      price: 420000,
    },
  },
]

export default function CustomerBids() {
  const [bidSessions] = useState(demoBidSessions)

  const getStatusBadge = (status: string) => {
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
      default:
        return null
    }
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m remaining`
  }

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
                  When you open a bid, installers have 48 hours to submit their proposals. You can review and select the
                  best offer. If no bid is selected within 48 hours, the bid expires and you can browse packages
                  directly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bid Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Bid Sessions ({bidSessions.length})</CardTitle>
            <CardDescription>View and manage your active and past bid sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {bidSessions.length === 0 ? (
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
                {bidSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Gavel className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{session.id}</p>
                          {getStatusBadge(session.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Application: {session.applicationId} • {session.bidsCount} bids received
                        </p>
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
