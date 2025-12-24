"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Clock, CheckCircle, Building2, Phone, Mail, Award } from "lucide-react"
import Link from "next/link"

const bidSession = {
  id: "BID-001",
  applicationId: "APP-001",
  status: "active",
  createdAt: "2024-01-18",
  expiresAt: "2024-01-25",
  capacity: "5 kW",
  address: "123 Solar Lane, Colombo 07",
  bids: [
    {
      id: "B-001",
      installer: "SunPower Lanka",
      rating: 4.8,
      completedProjects: 156,
      price: 1250000,
      warranty: "10 years",
      timeline: "14 days",
      package: "Premium Solar Package",
      contact: {
        phone: "+94 11 234 5678",
        email: "contact@sunpowerlanka.lk",
      },
    },
    {
      id: "B-002",
      installer: "GreenTech Solutions",
      rating: 4.6,
      completedProjects: 98,
      price: 1180000,
      warranty: "8 years",
      timeline: "10 days",
      package: "Standard Solar Package",
      contact: {
        phone: "+94 11 345 6789",
        email: "info@greentechsolutions.lk",
      },
    },
    {
      id: "B-003",
      installer: "EcoSolar Systems",
      rating: 4.7,
      completedProjects: 124,
      price: 1320000,
      warranty: "12 years",
      timeline: "12 days",
      package: "Premium Plus Package",
      contact: {
        phone: "+94 11 456 7890",
        email: "sales@ecosolar.lk",
      },
    },
  ],
}

export default function BidSessionDetail() {
  const params = useParams()
  const router = useRouter()
  const [selectedBid, setSelectedBid] = useState<(typeof bidSession.bids)[0] | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleAcceptBid = () => {
    alert(`Bid from ${selectedBid?.installer} accepted! The installer will be notified.`)
    router.push("/customer/bids")
  }

  const sortedBids = [...bidSession.bids].sort((a, b) => a.price - b.price)
  const lowestPrice = sortedBids[0]?.price
  const highestRated = [...bidSession.bids].sort((a, b) => b.rating - a.rating)[0]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/customer/bids">
            <Button variant="ghost" size="icon" className="bg-transparent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{params.id}</h1>
              <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
                Active
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {bidSession.address} | {bidSession.capacity}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bids</p>
                  <p className="text-xl font-bold text-foreground">{bidSession.bids.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lowest Bid</p>
                  <p className="text-xl font-bold text-emerald-500">LKR {lowestPrice?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className="text-xl font-bold text-foreground">
                    {new Date(bidSession.expiresAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Received Bids</CardTitle>
            <CardDescription>Compare quotes from verified installers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedBids.map((bid, index) => (
                <div
                  key={bid.id}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedBid?.id === bid.id
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-border hover:border-emerald-500/30"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{bid.installer}</p>
                          {bid.price === lowestPrice && (
                            <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
                              Lowest Price
                            </Badge>
                          )}
                          {bid.id === highestRated.id && (
                            <Badge className="bg-amber-500/10 text-amber-600" variant="secondary">
                              Top Rated
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {bid.rating}
                          </span>
                          <span>{bid.completedProjects} projects</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{bid.package}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="font-bold text-emerald-500">LKR {bid.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Warranty</p>
                          <p className="font-medium text-foreground">{bid.warranty}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Timeline</p>
                          <p className="font-medium text-foreground">{bid.timeline}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedBid(bid)
                          setShowConfirmDialog(true)
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Accept Bid
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {showConfirmDialog && selectedBid && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-foreground">Confirm Bid Acceptance</CardTitle>
                <CardDescription>You are about to accept the following bid</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-emerald-500" />
                    <span className="font-semibold text-foreground">{selectedBid.installer}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Package</p>
                      <p className="text-foreground">{selectedBid.package}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="font-bold text-emerald-500">LKR {selectedBid.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Warranty</p>
                      <p className="text-foreground">{selectedBid.warranty}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Timeline</p>
                      <p className="text-foreground">{selectedBid.timeline}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-cyan-500/10 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">Installer Contact</p>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {selectedBid.contact.phone}
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {selectedBid.contact.email}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConfirmDialog(false)
                      setSelectedBid(null)
                    }}
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAcceptBid} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
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
