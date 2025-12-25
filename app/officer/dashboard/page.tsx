"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  FileText,
  Building,
  Calendar,
  Receipt,
  Clock,
} from "lucide-react"

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
      try {
        const currentUser = await fetchCurrentUser()
        setUser(currentUser)

        const [apps, installerList, payments, userList] = await Promise.all([
          fetchApplications(),
          fetchInstallers(false),
          fetchPayments(),
          fetchUsers(),
        ])

        setApplications(apps)
        setInstallers(installerList)
        setInvoices(payments.invoices)
        setUsers(userList)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const stats = useMemo(() => {
    return {
      pendingApplications: applications.filter(
        (a) => a.status === "pending",
      ).length,

      pendingInstallerVerifications: installers.filter(
        (i) => !i.verified,
      ).length,

      scheduledSiteVisits: applications.filter(
        (a) => Boolean(a.siteVisitDate),
      ).length,

      pendingPayments: invoices.filter(
        (i) => i.status === "pending",
      ).length,

      totalCustomers: users.filter(
        (u) => u.role === "customer",
      ).length,

      totalVerifiedInstallers: installers.filter(
        (i) => i.verified,
      ).length,
    }
  }, [applications, installers, invoices, users])

  const recentApplications = applications.slice(0, 3)
  const pendingInstallers = installers
    .filter((i) => !i.verified)
    .slice(0, 3)
  const upcomingVisits = applications
    .filter((a) => a.siteVisitDate)
    .slice(0, 3)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Loading dashboard...
        </div>
      </DashboardLayout>
    )
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending: {
        label: "Pending",
        className: "bg-amber-500/10 text-amber-600",
      },
      under_review: {
        label: "Under Review",
        className: "bg-blue-500/10 text-blue-600",
      },
      site_visit_scheduled: {
        label: "Site Visit",
        className: "bg-cyan-500/10 text-cyan-600",
      },
    }

    const cfg = map[status] ?? map.pending

    return (
      <Badge variant="secondary" className={cfg.className}>
        <Clock className="w-3 h-3 mr-1" />
        {cfg.label}
      </Badge>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Officer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Pending Applications"
            value={stats.pendingApplications}
            icon={FileText}
            tone="amber"
          />
          <StatCard
            label="Installer Verifications"
            value={stats.pendingInstallerVerifications}
            icon={Building}
            tone="blue"
          />
          <StatCard
            label="Site Visits"
            value={stats.scheduledSiteVisits}
            icon={Calendar}
            tone="cyan"
          />
          <StatCard
            label="Pending Payments"
            value={stats.pendingPayments}
            icon={Receipt}
            tone="emerald"
          />
        </div>

        {/* Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ActivityCard
            title="Recent Applications"
            items={recentApplications.map((a) => ({
              id: a.id,
              title: a.customerName,
              badge: getStatusBadge(a.status),
            }))}
          />

          <ActivityCard
            title="Installer Verifications"
            items={pendingInstallers.map((i) => ({
              id: i.id,
              title: i.companyName,
              badge: (
                <Badge
                  variant="secondary"
                  className="bg-amber-500/10 text-amber-600"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              ),
            }))}
          />

          <ActivityCard
            title="Upcoming Site Visits"
            items={upcomingVisits.map((v) => ({
              id: v.id,
              title: v.customerName,
              subtitle: v.siteVisitDate,
            }))}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/officer/applications">
                <Button variant="outline" className="w-full">
                  Review Applications
                </Button>
              </Link>
              <Link href="/officer/installers">
                <Button variant="outline" className="w-full">
                  Verify Installers
                </Button>
              </Link>
              <Link href="/officer/payments">
                <Button variant="outline" className="w-full">
                  Verify Payments
                </Button>
              </Link>
              <Link href="/officer/billing">
                <Button variant="outline" className="w-full">
                  Generate Bills
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: React.ElementType
  tone: "amber" | "blue" | "cyan" | "emerald"
}) {
  const tones: Record<string, string> = {
    amber: "border-amber-500/20 bg-amber-500/5 text-amber-600",
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-600",
    cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-600",
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600",
  }

  return (
    <Card className={tones[tone]}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityCard({
  title,
  items,
}: {
  title: string
  items: {
    id: string
    title: string
    subtitle?: string
    badge?: React.ReactNode
  }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border"
            >
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground">
                    {item.subtitle}
                  </p>
                )}
              </div>
              {item.badge}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
