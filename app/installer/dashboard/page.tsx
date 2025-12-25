"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Gavel,
  ClipboardList,
  TrendingUp,
  Star,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Plus,
  Clock,
} from "lucide-react"
import {
  fetchApplications,
  fetchBidSessions,
  fetchCurrentUser,
  fetchInstallers,
  fetchPayments,
  type Application,
  type Installer,
  type BidSession,
  type User,
} from "@/lib/auth"

export default function InstallerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [installerProfile, setInstallerProfile] = useState<Installer | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [bidSessions, setBidSessions] = useState<BidSession[]>([])
  const [loading, setLoading] = useState(true)
  const [revenue, setRevenue] = useState(0)

  useEffect(() => {
    async function load() {
      try {
        const currentUser = await fetchCurrentUser()
        setUser(currentUser)
        const [installerList, apps, bids, payments] = await Promise.all([
          fetchInstallers(false),
          fetchApplications(),
          fetchBidSessions(),
          fetchPayments(),
        ])
        if (currentUser?.organization) {
          const profile = installerList.find((inst) => inst.id === currentUser.organization?.id)
          setInstallerProfile(profile ?? null)
        }
        setApplications(apps)
        setBidSessions(bids)
        setRevenue(
          payments.invoices
            .filter((inv) => inv.status === "paid")
            .reduce((sum, inv) => sum + inv.amount, 0),
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const isVerified = user?.verified !== false

  const stats = useMemo(() => {
    const activePackages = installerProfile?.packages.length ?? 0
    const pendingOrders = applications.filter(
      (app) =>
        app.status === "finding_installer" ||
        app.status === "installation_in_progress" ||
        app.status === "installation_complete",
    ).length
    return {
      activePackages,
      openBids: bidSessions.length,
      pendingOrders,
      completedInstallations: installerProfile?.completedInstallations ?? 0,
      rating: installerProfile?.rating ?? 0,
      totalRevenue: revenue,
    }
  }, [applications, bidSessions, installerProfile, revenue])

  const recentBids = bidSessions.slice(0, 3).map((session) => ({
    id: session.id,
    customerName: session.customerId,
    location: session.applicationId,
    capacity: session.bids[0]?.proposal || "",
    deadline: session.expiresAt,
  }))
  const recentOrders = applications.slice(0, 2).map((app) => ({
    id: app.id,
    customerName: app.customerName,
    status: app.status,
    amount: app.invoices?.[0]?.amount ?? 0,
  }))

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading dashboard...</div>
      </DashboardLayout>
    )
  }

  if (!isVerified) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Verification Pending</h2>
              <p className="text-muted-foreground mb-6">
                Your company registration is under review by CEB officers. Once verified, you will be able to create
                solar packages, bid on customer requests, and receive installation orders.
              </p>
              <div className="p-4 rounded-lg bg-muted/50 text-left space-y-2">
                <p className="text-sm font-medium text-foreground">What happens next:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>CEB officer will review your submitted documents</li>
                  <li>You may be contacted for additional information</li>
                  <li>Verification typically takes 2-3 business days</li>
                  <li>You will receive an email once verified</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified Installer
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {stats.rating}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/installer/packages/new">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Package
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Packages</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activePackages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Gavel className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open Bids</p>
                  <p className="text-2xl font-bold text-foreground">{stats.openBids}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">Rs. {(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Open Bids */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Open Bid Requests</CardTitle>
                <CardDescription>Submit proposals to win new customers</CardDescription>
              </div>
              <Link href="/installer/bids">
                <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-600">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentBids.length === 0 ? (
                <div className="text-center py-8">
                  <Gavel className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No open bids at the moment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBids.map((bid) => (
                    <div key={bid.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <p className="font-medium text-foreground">{bid.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {bid.location} • {bid.capacity}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">{bid.deadline}</span>
                        </div>
                        <Link href={`/installer/bids/${bid.id}`}>
                          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                            Bid
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Recent Orders</CardTitle>
                <CardDescription>Track your installation orders</CardDescription>
              </div>
              <Link href="/installer/orders">
                <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-600">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div>
                        <p className="font-medium text-foreground">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.id}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            order.status === "in_progress"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-amber-500/10 text-amber-600"
                          }
                          variant="secondary"
                        >
                          {order.status === "in_progress" ? "In Progress" : "Pending"}
                        </Badge>
                        <span className="font-semibold text-foreground">Rs. {order.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Performance Summary</CardTitle>
            <CardDescription>Your installation track record</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold text-foreground">{stats.completedInstallations}</p>
                <p className="text-sm text-muted-foreground">Completed Installations</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold text-foreground">{stats.rating}</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold text-foreground">98%</p>
                <p className="text-sm text-muted-foreground">On-time Completion</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold text-foreground">4.2</p>
                <p className="text-sm text-muted-foreground">Avg. Days to Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
