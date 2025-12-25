"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Zap,
  Download,
  CreditCard,
  Building,
} from "lucide-react"
import { fetchApplication, type Application } from "@/lib/auth"

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

const workflowSteps = [
  { key: "pending", label: "Application Submitted" },
  { key: "under_review", label: "Under Review" },
  { key: "site_visit_scheduled", label: "Site Visit" },
  { key: "approved", label: "Approved" },
  { key: "payment_pending", label: "Authority Fee" },
  { key: "finding_installer", label: "Find Installer" },
  { key: "installation_in_progress", label: "Installation" },
  { key: "final_inspection", label: "Final Inspection" },
  { key: "completed", label: "Completed" },
]

export default function ApplicationDetail() {
  const params = useParams()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const app = await fetchApplication(params.id as string)
        if (!app) {
          setError("Application not found")
        }
        setApplication(app)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load application")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Loading application...
        </div>
      </DashboardLayout>
    )
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  const status = statusConfig[application.status] || statusConfig.pending
  const StatusIcon = status.icon
  const currentStepIndex = workflowSteps.findIndex((s) => s.key === application.status)
  const canFindInstaller = ["approved", "payment_confirmed", "finding_installer"].includes(application.status)
  const needsPayment = application.status === "approved"

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/customer/applications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{application.id}</h1>
              <Badge className={status.color} variant="secondary">
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created on {new Date(application.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(application.documents).map(([key, file]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={file} target="_blank" rel="noreferrer">
                    <Download className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
