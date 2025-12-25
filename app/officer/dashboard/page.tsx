"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Building, Calendar, Receipt, Clock, ArrowRight, Users, TrendingUp, Zap } from "lucide-react"
import {
  fetchApplications,
  fetchCurrentUser,
  fetchInstallers,
  fetchPayments,
  fetchUsers,
  type Application,
  type Installer,
  type Invoice,
  type User,
} from "@/lib/auth"

export default function OfficerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [installers, setInstallers] = useState<Installer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
      const [apps, installersData, payments, userList] = await Promise.all([
        fetchApplications(),
        fetchInstallers(false),
        fetchPayments(),
        fetchUsers(),
      ])
      setApplications(apps)
      setInstallers(installersData)
      setInvoices(payments.invoices)
      setUsers(userList)
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const pendingApplications = applications.filter((app) => app.status === "pending").length
    const pendingInstallerVerifications = installers.filter((inst) => !inst.verified).length
    const scheduledSiteVisits = applications.filter((app) => app.siteVisitDate).length
    const pendingPayments = invoices.filter((inv) => inv.status === "pending").length
    const activeInstallations = applications.filter((app) =>
      ["installation_in_progress", "installation_complete", "final_inspection"].includes(app.status),
    ).length
    const totalCustomers = users.filter((u) => u.role === "customer").length
    const totalInstallers = installers.filter((inst) => inst.verified).length
    const totalCapacityMW =
      applications.reduce((sum, app) => {
        const capacity = parseFloat((app.selectedInstaller?.packageName || "").replace(/\D+/g, ""))
        return sum + (Number.isNaN(capacity) ? 0 : capacity / 1000)
      }, 0) || applications.length * 0.003

    return {
      pendingApplications,
      pendingInstallerVerifications,
      scheduledSiteVisits,
      pendingPayments,
      activeInstallations,
      totalCustomers,
      totalInstallers,
      totalCapacityMW: Number(totalCapacityMW.toFixed(2)),
    }
  }, [applications, installers, invoices, users])

  const recentApplications = applications.slice(0, 3)
  const pendingVerifications = installers.filter((inst) => !inst.verified).slice(0, 3)
  const upcomingSiteVisits = applications.filter((app) => app.siteVisitDate).slice(0, 3)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading dashboard...</div>
      </DashboardLayout>
    )
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: React.ElementType }> = {
      pending: { label: "Pending", color: "bg-amber-500/10 text-amber-600", icon: Clock },
      under_review: { label: "Under Review", color: "bg-blue-500/10 text-blue-600", icon: FileText },
      site_visit_scheduled: { label: "Site Visit", color: "bg-cyan-500/10 text-cyan-600", icon: Calendar },
    }
    const { label, color, icon: Icon } = config[status] || config.pending
    return (
      <Badge className={color} variant="secondary">
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Officer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}. Here is your overview.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Applications</p>
                  <p className="text-3xl font-bold text-amber-500">{stats.pendingApplications}</p>
                </div>
                <FileText className="w-8 h-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Installer Verifications</p>
                  <p className="text-3xl font-bold text-blue-500">{stats.pendingInstallerVerifications}</p>
                </div>
                <Building className="w-8 h-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-cyan-500/20 bg-cyan-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Site Visits Today</p>
                  <p className="text-3xl font-bold text-cyan-500">{stats.scheduledSiteVisits}</p>
                </div>
                <Calendar className="w-8 h-8 text-cyan-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                  <p className="text-3xl font-bold text-emerald-500">{stats.pendingPayments}</p>
                </div>
                <Receipt className="w-8 h-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Customers</p>
                  <p className="text-lg font-bold text-foreground">{stats.totalCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Building className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Verified Installers</p>
                  <p className="text-lg font-bold text-foreground">{stats.totalInstallers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Zap className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Installations</p>
                  <p className="text-lg font-bold text-foreground">{stats.activeInstallations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Capacity</p>
                  <p className="text-lg font-bold text-foreground">{stats.totalCapacityMW} MW</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base text-foreground">Recent Applications</CardTitle>
                <CardDescription>Requires your attention</CardDescription>
              </div>
              <Link href="/officer/applications">
                <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-sm text-foreground">{app.customerName}</p>
                    <p className="text-xs text-muted-foreground">{app.id}</p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Verifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base text-foreground">Installer Verifications</CardTitle>
                <CardDescription>Awaiting approval</CardDescription>
              </div>
              <Link href="/officer/installers">
                <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingVerifications.map((installer) => (
                <div
                  key={installer.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium text-sm text-foreground">{installer.companyName}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {new Date(installer.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-600" variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Site Visits */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base text-foreground">Site Visits</CardTitle>
                <CardDescription>Upcoming schedule</CardDescription>
              </div>
              <Link href="/officer/site-visits">
                <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingSiteVisits.map((visit) => (
                <div key={visit.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-sm text-foreground">{visit.customerName}</p>
                    <p className="text-xs text-muted-foreground">{visit.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(visit.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-muted-foreground">{visit.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/officer/applications?status=pending" className="block">
                <div className="p-4 rounded-lg border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors text-center">
                  <FileText className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <p className="text-sm font-medium text-foreground">Review Applications</p>
                </div>
              </Link>
              <Link href="/officer/installers?status=pending" className="block">
                <div className="p-4 rounded-lg border border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors text-center">
                  <Building className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                  <p className="text-sm font-medium text-foreground">Verify Installers</p>
                </div>
              </Link>
              <Link href="/officer/payments" className="block">
                <div className="p-4 rounded-lg border border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors text-center">
                  <Receipt className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm font-medium text-foreground">Verify Payments</p>
                </div>
              </Link>
              <Link href="/officer/billing" className="block">
                <div className="p-4 rounded-lg border border-border hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-colors text-center">
                  <TrendingUp className="w-8 h-8 mx-auto text-cyan-500 mb-2" />
                  <p className="text-sm font-medium text-foreground">Generate Bills</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
