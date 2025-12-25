"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gavel, Clock, MapPin, Zap, ArrowRight, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { getUser, type BidSession, type Bid, type User } from "@/lib/auth"

export default function InstallerBids() {
  const [activeTab, setActiveTab] = useState("open")
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<BidSession[]>([])
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
    const fetchSessions = async () => {
      setError(null)
      try {
        const res = await fetch("/api/bids")
        if (!res.ok) throw new Error("Unable to load bids")
        const data = await res.json()
        setSessions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error")
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [])

  const installerId = user?.id ?? "INS-001"

  const openBids = useMemo(() => sessions.filter((session) => session.status === "open"), [sessions])

  const myBids: (Bid & { sessionId: string; capacity?: string; address?: string })[] = useMemo(() => {
    const submissions: (Bid & { sessionId: string; capacity?: string; address?: string })[] = []
    sessions.forEach((session) => {
      session.bids.forEach((bid) => {
        if (bid.installerId === installerId) {
          submissions.push({
            ...bid,
            sessionId: session.id,
            capacity: session.applicationDetails?.capacity,
            address: session.applicationDetails?.address,
          })
        }
      })
    })
    return submissions
  }, [installerId, sessions])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600" variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-600" variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            Not Selected
          </Badge>
        )
      default:
        return null
    }
  }

  const countdown = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - now.getTime()
    if (diff <= 0) return "Expired"
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return days > 0 ? `${days}d ${remainingHours}h` : `${hours}h ${minutes}m`
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bid Requests</h1>
          <p className="text-muted-foreground">View open bids and submit your proposals</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="open">Open Bids ({openBids.length})</TabsTrigger>
            <TabsTrigger value="my-bids">My Bids ({myBids.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="mt-4 space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading bids...
              </div>
            ) : error ? (
              <Card>
                <CardContent className="py-4 text-destructive">{error}</CardContent>
              </Card>
            ) : openBids.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Gavel className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No open bids</h3>
                  <p className="text-muted-foreground">Check back later for new bid opportunities</p>
                </CardContent>
              </Card>
            ) : (
              openBids.map((bid) => (
                <Card key={bid.id} className="hover:border-amber-500/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">{bid.applicationId}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="w-4 h-4" />
                              {bid.applicationDetails?.address ?? "Address not provided"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-amber-500">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{countdown(bid.expiresAt)}</span>
                          </div>
                        </div>

                        <p className="text-muted-foreground">{bid.requirements ?? "No additional requirements"}</p>

                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm">
                            <Zap className="w-3 h-3" />
                            {bid.applicationDetails?.capacity ?? "Capacity TBD"}
                          </div>
                          <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm capitalize">
                            {bid.bidType} bid
                          </div>
                          <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                            {new Date(bid.startedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-2 lg:items-end">
                        <Link href={`/installer/bids/${bid.id}`} className="flex-1 lg:flex-none">
                          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                            Submit Bid
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                        <Button variant="outline" className="flex-1 lg:flex-none bg-transparent">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="my-bids" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Submitted Bids</CardTitle>
                <CardDescription>Track the status of your bid submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading bids...
                  </div>
                ) : myBids.length === 0 ? (
                  <div className="text-center py-8">
                    <Gavel className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">{"You haven't submitted any bids yet"}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myBids.map((bid) => (
                      <div
                        key={bid.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border"
                      >
                        <div className="mb-3 sm:mb-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{bid.sessionId}</p>
                            {getStatusBadge(bid.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {bid.address ?? "Location TBD"} • {bid.capacity ?? "Capacity TBD"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {new Date(bid.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Your Bid</p>
                            <p className="font-bold text-foreground">Rs. {bid.price.toLocaleString()}</p>
                          </div>
                          {bid.status === "accepted" && (
                            <Link href={`/installer/orders/${bid.id}`}>
                              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                                View Order
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
