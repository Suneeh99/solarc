"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, FileText, Clock, CheckCircle, AlertCircle, Calendar, ArrowRight, Zap } from "lucide-react"
import { fetchApplications, type Application } from "@/lib/auth"

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending Review", color: "bg-amber-500/10 text-amber-600", icon: Clock },
  under_review: { label: "Under Review", color: "bg-blue-500/10 text-blue-600", icon: FileText },
  site_visit_scheduled: { label: "Site Visit Scheduled", color: "bg-cyan-500/10 text-cyan-600", icon: Calendar },
  approved: { label: "Approved", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600", icon: AlertCircle },
  payment_pending: { label: "Payment Pending", color: "bg-amber-500/10 text-amber-600", icon: Clock },
  payment_confirmed: { label: "Payment Confirmed", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  finding_installer: { label: "Finding Installer", color: "bg-blue-500/10 text-blue-600", icon: FileText },
  installation_in_progress: { label: "Installation In Progress", color: "bg-cyan-500/10 text-cyan-600", icon: Zap },
  installation_complete: {
    label: "Installation Complete",
    color: "bg-emerald-500/10 text-emerald-600",
    icon: CheckCircle,
  },
  final_inspection: { label: "Final Inspection", color: "bg-blue-500/10 text-blue-600", icon: FileText },
  agreement_pending: { label: "Agreement Pending", color: "bg-amber-500/10 text-amber-600", icon: Clock },
  completed: { label: "Completed", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
}

export default function CustomerApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const apps = await fetchApplications()
        setApplications(apps)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load applications")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
            <p className="text-muted-foreground">View and manage all your solar installation applications</p>
          </div>
          <Link href="/customer/applications/new">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by application ID..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="payment_pending">Payment Pending</SelectItem>
                  <SelectItem value="installation_in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Applications ({filteredApplications.length})</CardTitle>
            <CardDescription>Click on an application to view details and track progress</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading applications...</div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No applications found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter"
                    : "Start your solar journey by creating a new application"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Link href="/customer/applications/new">
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Application
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => {
                  const status = statusConfig[app.status] || statusConfig.pending
                  const StatusIcon = status.icon
                  return (
                    <div
                      key={app.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
                        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{app.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {app.technicalDetails.roofType} • {app.technicalDetails.monthlyConsumption}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created: {new Date(app.createdAt).toLocaleDateString()} • Updated:{" "}
                            {new Date(app.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <Badge className={status.color} variant="secondary">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                        <Link href={`/customer/applications/${app.id}`}>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            View Details
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
