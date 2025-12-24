"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Download,
  Star,
  Phone,
  Mail,
  MapPin,
  XCircle,
} from "lucide-react"

const installers = [
  {
    id: "INS-001",
    companyName: "Solar Pro Ltd",
    email: "contact@solarpro.lk",
    phone: "+94 11 234 5678",
    address: "123 Solar Street, Colombo",
    registrationNumber: "REG-2024-001",
    description: "Leading solar installation company with 10+ years experience",
    status: "verified",
    verifiedAt: "2024-01-10",
    rating: 4.8,
    completedInstallations: 150,
    documents: ["Registration Certificate", "Business License", "Insurance Certificate"],
  },
  {
    id: "INS-002",
    companyName: "Green Energy Solutions",
    email: "info@greenenergy.lk",
    phone: "+94 11 345 6789",
    address: "456 Energy Lane, Kandy",
    registrationNumber: "REG-2024-002",
    description: "Eco-friendly solar solutions for residential and commercial",
    status: "verified",
    verifiedAt: "2024-01-12",
    rating: 4.6,
    completedInstallations: 95,
    documents: ["Registration Certificate", "Business License"],
  },
  {
    id: "INS-003",
    companyName: "SunPower Systems",
    email: "hello@sunpower.lk",
    phone: "+94 11 456 7890",
    address: "789 Renewable Road, Galle",
    registrationNumber: "REG-2024-003",
    description: "Premium solar installations with cutting-edge technology",
    status: "pending",
    submittedAt: "2024-01-19",
    documents: ["Registration Certificate", "Business License", "Technical Certifications"],
  },
  {
    id: "INS-004",
    companyName: "Green Solar Co",
    email: "contact@greensolar.lk",
    phone: "+94 11 567 8901",
    address: "321 Sun Avenue, Matara",
    registrationNumber: "REG-2024-004",
    description: "Affordable solar solutions for every home",
    status: "pending",
    submittedAt: "2024-01-18",
    documents: ["Registration Certificate"],
  },
  {
    id: "INS-005",
    companyName: "Rejected Solar Inc",
    email: "info@rejected.lk",
    phone: "+94 11 678 9012",
    address: "999 Failed Street, Colombo",
    registrationNumber: "REG-2024-005",
    description: "Solar company with incomplete documentation",
    status: "rejected",
    rejectedAt: "2024-01-15",
    rejectionReason: "Incomplete documentation and invalid business license",
    documents: ["Registration Certificate"],
  },
]

function OfficerInstallersContent() {
  const searchParams = useSearchParams()
  const defaultStatus = searchParams.get("status") || "all"

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState(defaultStatus === "pending" ? "pending" : "all")
  const [selectedInstaller, setSelectedInstaller] = useState<(typeof installers)[0] | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: React.ElementType }> = {
      pending: { label: "Pending", color: "bg-amber-500/10 text-amber-600", icon: Clock },
      verified: { label: "Verified", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
      rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600", icon: XCircle },
    }
    const { label, color, icon: Icon } = config[status] || config.pending
    return (
      <Badge className={color} variant="secondary">
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    )
  }

  const filteredInstallers = installers.filter((installer) => {
    const matchesSearch =
      installer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      installer.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && installer.status === "pending") ||
      (activeTab === "verified" && installer.status === "verified") ||
      (activeTab === "rejected" && installer.status === "rejected")
    return matchesSearch && matchesTab
  })

  const handleVerify = () => {
    alert(`Installer ${selectedInstaller?.companyName} verified!`)
    setSelectedInstaller(null)
  }

  const handleReject = () => {
    alert(`Installer ${selectedInstaller?.companyName} rejected. Reason: ${rejectReason}`)
    setShowRejectDialog(false)
    setSelectedInstaller(null)
    setRejectReason("")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Installer Management</h1>
          <p className="text-muted-foreground">Verify and manage solar installation companies</p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by company name or ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({installers.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({installers.filter((i) => i.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="verified">
              Verified ({installers.filter((i) => i.status === "verified").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({installers.filter((i) => i.status === "rejected").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Installers ({filteredInstallers.length})</CardTitle>
                <CardDescription>Click on an installer to review details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredInstallers.map((installer) => (
                    <div
                      key={installer.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-lg border border-border hover:border-blue-500/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedInstaller(installer)}
                    >
                      <div className="flex items-start gap-4 mb-4 lg:mb-0">
                        <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Building className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{installer.companyName}</p>
                            {getStatusBadge(installer.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{installer.id}</p>
                          <p className="text-xs text-muted-foreground mt-1">{installer.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {installer.status === "verified" && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="font-medium text-foreground">{installer.rating}</span>
                          </div>
                        )}
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Installer Detail Dialog */}
        <Dialog open={!!selectedInstaller && !showRejectDialog} onOpenChange={() => setSelectedInstaller(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Installer Details</DialogTitle>
              <DialogDescription>{selectedInstaller?.id}</DialogDescription>
            </DialogHeader>
            {selectedInstaller && (
              <div className="space-y-6">
                {/* Company Info */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Building className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">{selectedInstaller.companyName}</h3>
                      {getStatusBadge(selectedInstaller.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{selectedInstaller.description}</p>
                    {selectedInstaller.status === "verified" && (
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          {selectedInstaller.rating} rating
                        </span>
                        <span className="text-muted-foreground">
                          {selectedInstaller.completedInstallations} installations
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-foreground mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {selectedInstaller.email}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {selectedInstaller.phone}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {selectedInstaller.address}
                    </div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-foreground mb-3">Business Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Registration Number</p>
                      <p className="text-foreground">{selectedInstaller.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="text-foreground capitalize">{selectedInstaller.status}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-foreground mb-3">Submitted Documents</h4>
                  <div className="space-y-2">
                    {selectedInstaller.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded border border-border">
                        <span className="text-sm text-foreground">{doc}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Download className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedInstaller.status === "rejected" && selectedInstaller.rejectionReason && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <h4 className="font-semibold text-red-500 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Rejection Reason
                    </h4>
                    <p className="text-sm text-foreground">{selectedInstaller.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              {selectedInstaller?.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-500 border-red-500/50 hover:bg-red-500/10 bg-transparent"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleVerify}>
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Verify Installer
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-foreground">Reject Installer</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejection. This will be sent to the installer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rejection Reason</Label>
                <Textarea
                  placeholder="Enter the reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="bg-transparent">
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default function OfficerInstallers() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OfficerInstallersContent />
    </Suspense>
  )
}
