"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gavel, Clock, MapPin, Zap, ArrowRight, CheckCircle, XCircle } from "lucide-react"

const openBids = [
  {
    id: "BID-001",
    customerName: "John Customer",
    location: "Colombo 07",
    capacity: "5 kW",
    roofType: "Flat Concrete",
    monthlyConsumption: "450 kWh",
    deadline: "2h 30m",
    description: "Looking for a reliable solar installation for my residential property.",
    postedAt: "2024-01-20T08:00:00Z",
  },
  {
    id: "BID-002",
    customerName: "Jane Smith",
    location: "Kandy",
    capacity: "3 kW",
    roofType: "Sloped Tile",
    monthlyConsumption: "280 kWh",
    deadline: "12h 45m",
    description: "Need solar panels for my house. Looking for good warranty terms.",
    postedAt: "2024-01-19T14:00:00Z",
  },
  {
    id: "BID-003",
    customerName: "Mike Johnson",
    location: "Galle",
    capacity: "10 kW",
    roofType: "Metal Sheet",
    monthlyConsumption: "800 kWh",
    deadline: "36h 20m",
    description: "Commercial property solar installation. Need high capacity system.",
    postedAt: "2024-01-19T10:00:00Z",
  },
]

const myBids = [
  {
    id: "BID-004",
    customerName: "Sarah Williams",
    location: "Negombo",
    capacity: "5 kW",
    myBidAmount: 420000,
    status: "accepted",
    submittedAt: "2024-01-18",
  },
  {
    id: "BID-005",
    customerName: "Tom Brown",
    location: "Colombo 05",
    capacity: "3 kW",
    myBidAmount: 320000,
    status: "pending",
    submittedAt: "2024-01-19",
  },
  {
    id: "BID-006",
    customerName: "Lisa Green",
    location: "Matara",
    capacity: "5 kW",
    myBidAmount: 450000,
    status: "rejected",
    submittedAt: "2024-01-17",
  },
]

export default function InstallerBids() {
  const [activeTab, setActiveTab] = useState("open")

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
            {openBids.length === 0 ? (
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
                            <h3 className="font-semibold text-lg text-foreground">{bid.customerName}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="w-4 h-4" />
                              {bid.location}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-amber-500">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{bid.deadline}</span>
                          </div>
                        </div>

                        <p className="text-muted-foreground">{bid.description}</p>

                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm">
                            <Zap className="w-3 h-3" />
                            {bid.capacity}
                          </div>
                          <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                            {bid.roofType}
                          </div>
                          <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                            {bid.monthlyConsumption}/month
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
                {myBids.length === 0 ? (
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
                            <p className="font-semibold text-foreground">{bid.customerName}</p>
                            {getStatusBadge(bid.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {bid.location} • {bid.capacity}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {new Date(bid.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Your Bid</p>
                            <p className="font-bold text-foreground">Rs. {bid.myBidAmount.toLocaleString()}</p>
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
