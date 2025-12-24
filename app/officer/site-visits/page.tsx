"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, CheckCircle, MapPin, ThumbsUp, ThumbsDown, Navigation } from "lucide-react"

const siteVisits = [
  {
    id: "SV-001",
    applicationId: "APP-003",
    customerName: "Mike Johnson",
    phone: "+94 77 345 6789",
    address: "789 Beach Road, Galle",
    date: "2024-01-22",
    time: "10:00 AM",
    status: "scheduled",
    technicalDetails: {
      roofType: "Metal Sheet",
      roofArea: "100 sqm",
      desiredCapacity: "10 kW",
    },
  },
  {
    id: "SV-002",
    applicationId: "APP-007",
    customerName: "Lisa Green",
    phone: "+94 77 567 8901",
    address: "321 Mountain View, Kandy",
    date: "2024-01-23",
    time: "2:00 PM",
    status: "scheduled",
    technicalDetails: {
      roofType: "Flat Concrete",
      roofArea: "80 sqm",
      desiredCapacity: "5 kW",
    },
  },
  {
    id: "SV-003",
    applicationId: "APP-005",
    customerName: "Tom Brown",
    phone: "+94 77 456 7890",
    address: "456 Palm Avenue, Colombo 05",
    date: "2024-01-20",
    time: "11:00 AM",
    status: "completed",
    completedAt: "2024-01-20",
    notes: "Roof is in good condition. Suitable for 5kW system. No shading issues observed.",
    recommendation: "approved",
  },
  {
    id: "SV-004",
    applicationId: "APP-006",
    customerName: "Emma Davis",
    phone: "+94 77 678 9012",
    address: "123 Sea View, Negombo",
    date: "2024-01-19",
    time: "3:00 PM",
    status: "completed",
    completedAt: "2024-01-19",
    notes: "Roof has structural issues. Needs reinforcement before installation.",
    recommendation: "rejected",
  },
]

export default function OfficerSiteVisits() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [selectedVisit, setSelectedVisit] = useState<(typeof siteVisits)[0] | null>(null)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [visitNotes, setVisitNotes] = useState("")
  const [recommendation, setRecommendation] = useState<"approved" | "rejected" | null>(null)

  const upcomingVisits = siteVisits.filter((v) => v.status === "scheduled")
  const completedVisits = siteVisits.filter((v) => v.status === "completed")

  const handleCompleteVisit = () => {
    alert(`Visit ${selectedVisit?.id} completed. Recommendation: ${recommendation}`)
    setShowCompleteDialog(false)
    setSelectedVisit(null)
    setVisitNotes("")
    setRecommendation(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Site Visits</h1>
          <p className="text-muted-foreground">Manage scheduled site inspections and record findings</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold text-foreground">{upcomingVisits.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-cyan-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{completedVisits.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold text-foreground">
                    {upcomingVisits.filter((v) => v.date === "2024-01-22").length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcomingVisits.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedVisits.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Scheduled Visits</CardTitle>
                <CardDescription>Click on a visit to view details or mark as complete</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingVisits.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No upcoming site visits</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingVisits.map((visit) => (
                      <div
                        key={visit.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:border-cyan-500/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedVisit(visit)}
                      >
                        <div className="flex items-start gap-4 mb-4 sm:mb-0">
                          <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                            <Calendar className="w-6 h-6 text-cyan-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{visit.customerName}</p>
                            <p className="text-sm text-muted-foreground">{visit.applicationId}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3" />
                              {visit.address}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-foreground">
                              {new Date(visit.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">{visit.time}</p>
                          </div>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <Navigation className="w-4 h-4 mr-1" />
                            Directions
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Completed Visits</CardTitle>
                <CardDescription>View past site visit reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedVisits.map((visit) => (
                    <div
                      key={visit.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-start gap-4 mb-4 sm:mb-0">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{visit.customerName}</p>
                            <Badge
                              className={
                                visit.recommendation === "approved"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-red-500/10 text-red-600"
                              }
                              variant="secondary"
                            >
                              {visit.recommendation === "approved" ? (
                                <ThumbsUp className="w-3 h-3 mr-1" />
                              ) : (
                                <ThumbsDown className="w-3 h-3 mr-1" />
                              )}
                              {visit.recommendation === "approved" ? "Approved" : "Rejected"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{visit.applicationId}</p>
                          <p className="text-xs text-muted-foreground mt-1">{visit.notes}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Completed{" "}
                          {new Date(visit.completedAt!).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Visit Detail Dialog */}
        {selectedVisit && !showCompleteDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle className="text-foreground">Visit Details</CardTitle>
                <CardDescription>{selectedVisit.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium text-foreground">{selectedVisit.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{selectedVisit.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium text-foreground">{selectedVisit.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">{selectedVisit.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium text-foreground">{selectedVisit.time}</p>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-foreground mb-2">Technical Details</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Roof Type</p>
                      <p className="text-foreground">{selectedVisit.technicalDetails?.roofType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Area</p>
                      <p className="text-foreground">{selectedVisit.technicalDetails?.roofArea}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Capacity</p>
                      <p className="text-foreground">{selectedVisit.technicalDetails?.desiredCapacity}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setSelectedVisit(null)} className="flex-1 bg-transparent">
                    Close
                  </Button>
                  <Button
                    onClick={() => setShowCompleteDialog(true)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Complete Visit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Complete Visit Dialog */}
        {showCompleteDialog && selectedVisit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle className="text-foreground">Complete Site Visit</CardTitle>
                <CardDescription>Record your findings for {selectedVisit.customerName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Visit Notes</label>
                  <textarea
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    className="w-full h-32 p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter your observations about the site..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Recommendation</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setRecommendation("approved")}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                        recommendation === "approved"
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-border hover:border-emerald-500/50"
                      }`}
                    >
                      <ThumbsUp
                        className={`w-6 h-6 mx-auto mb-2 ${
                          recommendation === "approved" ? "text-emerald-500" : "text-muted-foreground"
                        }`}
                      />
                      <p
                        className={`text-sm font-medium ${
                          recommendation === "approved" ? "text-emerald-500" : "text-foreground"
                        }`}
                      >
                        Approve
                      </p>
                    </button>
                    <button
                      onClick={() => setRecommendation("rejected")}
                      className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                        recommendation === "rejected"
                          ? "border-red-500 bg-red-500/10"
                          : "border-border hover:border-red-500/50"
                      }`}
                    >
                      <ThumbsDown
                        className={`w-6 h-6 mx-auto mb-2 ${
                          recommendation === "rejected" ? "text-red-500" : "text-muted-foreground"
                        }`}
                      />
                      <p
                        className={`text-sm font-medium ${
                          recommendation === "rejected" ? "text-red-500" : "text-foreground"
                        }`}
                      >
                        Reject
                      </p>
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCompleteDialog(false)
                      setVisitNotes("")
                      setRecommendation(null)
                    }}
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCompleteVisit}
                    disabled={!visitNotes || !recommendation}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Submit Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
