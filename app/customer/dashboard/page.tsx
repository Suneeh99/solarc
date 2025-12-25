"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  Sun,
  FileText,
  Leaf,
  Zap,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react"

import {
  fetchApplications,
  fetchCurrentUser,
  type Application,
  type User,
} from "@/lib/auth"

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending Review",
    color: "bg-amber-500/10 text-amber-600",
    icon: Clock,
  },
  under_review: {
    label: "Under Review",
    color: "bg-blue-500/10 text-blue-600",
    icon: FileText,
  },
  site_visit_scheduled: {
    label: "Site Visit Scheduled",
    color: "bg-cyan-500/10 text-cyan-600",
    icon: Calendar,
  },
  approved: {
    label: "Approved",
    color: "bg-emerald-500/10 text-emerald-600",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-500/10 text-red-600",
    icon: AlertCircle,
  },
  payment_pending: {
    label: "Payment Pending",
    color: "bg-amber-500/10 text-amber-600",
    icon: Clock,
  },
  payment_confirmed: {
    label: "Payment Confirmed",
    color: "bg-emerald-500/10 text-emerald-600",
    icon: CheckCircle,
  },
  finding_installer: {
    label: "Finding Installer",
    color: "bg-blue-500/10 text-blue-600",
    icon: FileText,
  },
  installation_in_progress: {
    label: "Installation In Progress",
    color: "bg-cyan-500/10 text-cyan-600",
    icon: Zap,
  },
  installation_complete: {
    label: "Installation Complete",
    color: "bg-emerald-500/10 text-emerald-600",
    icon: CheckCircle,
  },
  final_inspection: {
    label: "Final Inspection",
    color: "bg-blue-500/10 text-blue-600",
    icon: FileText,
  },
  agreement_pending: {
    label: "Agreement Pending",
    color: "bg-amber-500/10 text-amber-600",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-500/10 text-emerald-600",
    icon: CheckCircle,
  },
}

export default function CustomerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const currentUser = await fetchCurrentUser()
        setUser(currentUser)

        const apps = await fetchApplications()
        setApplications(
          currentUser
            ? apps.filter((app) => app.customerId === currentUser.id)
            : [],
        )
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load dashboard",
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const stats = {
    totalCO2Prevented: 2.5,
    totalEnergyGenerated: 1250,
    monthlySavings: 15000,
    systemCapacity: 5,
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Loading dashboard...
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-muted-foreground">
              Track your solar installation journey
            </p>
          </div>
          <Link href="/customer/applications/new">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Leaf} label="CO₂ Prevented" value={`${stats.totalCO2Prevented} tons`} />
          <StatCard icon={Sun} label="Energy Generated" value={`${stats.totalEnergyGenerated} kWh`} />
          <StatCard icon={TrendingUp} label="Monthly Savings" value={`Rs. ${stats.monthlySavings.toLocaleString()}`} />
          <StatCard icon={Zap} label="System Capacity" value={`${stats.systemCapacity} kW`} />
        </div>

        {/* Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>
                Track the status of your solar installation applications
              </CardDescription>
            </div>
            <Link href="/customer/applications">
              <Button variant="ghost" size="sm" className="text-emerald-500">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your solar journey by creating a new application
                </p>
                <Link href="/customer/applications/new">
                  <Button className="bg-emerald-500 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Application
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const status =
                    statusConfig[app.status] || statusConfig.pending
                  const StatusIcon = status.icon

                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{app.id}</p>
                        <p className="text-sm text-muted-foreground">
                          Created on{" "}
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={status.color} variant="secondary">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                        <Link href={`/customer/applications/${app.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
