"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MapPin, Zap, Calendar, Clock, Send, Package } from "lucide-react"
import Link from "next/link"

const bidRequest = {
  id: "BID-003",
  customerId: "CUST-003",
  applicationId: "APP-003",
  address: "789 Beach Road, Galle",
  capacity: "10 kW",
  roofType: "Metal Sheet",
  roofArea: "100 sqm",
  createdAt: "2024-01-20",
  expiresAt: "2024-01-27",
  requirements: "Looking for high-efficiency panels with good warranty coverage.",
  status: "open",
}

const availablePackages = [
  {
    id: "PKG-001",
    name: "Premium Solar Package",
    capacity: "10 kW",
    price: 2400000,
    warranty: "10 years",
    panels: "Jinko Tiger Neo N-type",
    inverter: "Huawei SUN2000",
  },
  {
    id: "PKG-002",
    name: "Standard Solar Package",
    capacity: "10 kW",
    price: 2150000,
    warranty: "8 years",
    panels: "Canadian Solar HiKu6",
    inverter: "Growatt MIN",
  },
]

export default function SubmitBidPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState("")
  const [customPrice, setCustomPrice] = useState("")
  const [timeline, setTimeline] = useState("14")
  const [notes, setNotes] = useState("")

  const selectedPkg = availablePackages.find((p) => p.id === selectedPackage)

  const handleSubmitBid = () => {
    const price = customPrice || selectedPkg?.price
    alert(`Bid submitted successfully! Price: LKR ${Number(price).toLocaleString()}`)
    router.push("/installer/bids")
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/installer/bids">
            <Button variant="ghost" size="icon" className="bg-transparent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Submit Bid</h1>
            <p className="text-muted-foreground">Bid Request {params.id}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Project Details</CardTitle>
                <CardDescription>Customer requirements for this installation</CardDescription>
              </div>
              <Badge className="bg-amber-500/10 text-amber-600" variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                Expires {new Date(bidRequest.expiresAt).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{bidRequest.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Desired Capacity</p>
                    <p className="font-medium text-foreground">{bidRequest.capacity}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Roof Type</p>
                  <p className="font-medium text-foreground">{bidRequest.roofType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roof Area</p>
                  <p className="font-medium text-foreground">{bidRequest.roofArea}</p>
                </div>
              </div>
            </div>
            {bidRequest.requirements && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">Special Requirements</p>
                <p className="text-sm text-muted-foreground">{bidRequest.requirements}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Select Package</CardTitle>
            <CardDescription>Choose one of your packages for this bid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availablePackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => {
                  setSelectedPackage(pkg.id)
                  setCustomPrice("")
                }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedPackage === pkg.id
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-border hover:border-emerald-500/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{pkg.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pkg.panels} | {pkg.inverter}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{pkg.warranty} warranty</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-500">LKR {pkg.price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{pkg.capacity}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Bid Details</CardTitle>
            <CardDescription>Customize your offer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="price">Custom Price (LKR) - Optional</Label>
              <Input
                id="price"
                type="number"
                placeholder={
                  selectedPkg ? `Package price: ${selectedPkg.price.toLocaleString()}` : "Select a package first"
                }
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">Leave empty to use the package price</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Installation Timeline (Days)
              </Label>
              <select
                id="timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="7">7 Days</option>
                <option value="10">10 Days</option>
                <option value="14">14 Days</option>
                <option value="21">21 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-24 p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Any additional information or special offers..."
              />
            </div>
          </CardContent>
        </Card>

        {selectedPackage && (
          <Card className="bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Bid Summary</p>
                  <p className="font-semibold text-foreground">{selectedPkg?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p className="text-xl font-bold text-emerald-500">
                    LKR {(Number(customPrice) || selectedPkg?.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Link href="/installer/bids" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSubmitBid}
            disabled={!selectedPackage}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Bid
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
