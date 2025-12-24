"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ClipboardList, Clock, CheckCircle, MapPin, Phone, Mail, Calendar } from "lucide-react"

const orders = [
  {
    id: "ORD-001",
    customerName: "Sarah Williams",
    email: "sarah@example.com",
    phone: "+94 77 123 4567",
    location: "123 Main Street, Negombo",
    packageName: "Premium Solar Package",
    capacity: "5 kW",
    amount: 450000,
    status: "installation_pending",
    paymentStatus: "paid",
    createdAt: "2024-01-15",
    scheduledDate: "2024-01-25",
  },
  {
    id: "ORD-002",
    customerName: "Tom Brown",
    email: "tom@example.com",
    phone: "+94 77 234 5678",
    location: "456 Palm Avenue, Colombo 05",
    packageName: "Basic Solar Package",
    capacity: "3 kW",
    amount: 320000,
    status: "in_progress",
    paymentStatus: "paid",
    createdAt: "2024-01-12",
    scheduledDate: "2024-01-20",
    startedAt: "2024-01-20",
  },
  {
    id: "ORD-003",
    customerName: "Emma Davis",
    email: "emma@example.com",
    phone: "+94 77 345 6789",
    location: "789 Beach Road, Galle",
    packageName: "Premium Solar Package",
    capacity: "5 kW",
    amount: 450000,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2024-01-01",
    scheduledDate: "2024-01-10",
    startedAt: "2024-01-10",
    completedAt: "2024-01-13",
  },
]

export default function InstallerOrders() {
  const [selectedOrder, setSelectedOrder] = useState<(typeof orders)[0] | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "installation_pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600" variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending Start
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-blue-500/10 text-blue-600" variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      default:
        return null
    }
  }

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((order) => {
          if (activeTab === "pending") return order.status === "installation_pending"
          if (activeTab === "in_progress") return order.status === "in_progress"
          if (activeTab === "completed") return order.status === "completed"
          return true
        })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Installation Orders</h1>
          <p className="text-muted-foreground">Manage your solar installation projects</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">
                    {orders.filter((o) => o.status === "installation_pending").length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-foreground">
                    {orders.filter((o) => o.status === "in_progress").length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">
                    {orders.filter((o) => o.status === "completed").length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    Rs. {orders.reduce((sum, o) => sum + o.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Orders ({filteredOrders.length})</CardTitle>
                <CardDescription>Click on an order to view details and update status</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No orders in this category</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <Dialog key={order.id}>
                        <DialogTrigger asChild>
                          <div
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:border-amber-500/30 cursor-pointer transition-colors"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <div className="mb-3 sm:mb-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground">{order.customerName}</p>
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {order.packageName} • {order.capacity}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3" />
                                {order.location}
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4">
                              <div className="text-right">
                                <p className="font-bold text-foreground">Rs. {order.amount.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">
                                  Scheduled: {new Date(order.scheduledDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-foreground">Order Details</DialogTitle>
                            <DialogDescription>{order.id}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{order.customerName}</span>
                                {getStatusBadge(order.status)}
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Mail className="w-4 h-4" />
                                  {order.email}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone className="w-4 h-4" />
                                  {order.phone}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  {order.location}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  Scheduled: {new Date(order.scheduledDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between p-3 rounded-lg border border-border">
                              <span className="text-muted-foreground">Package</span>
                              <span className="font-medium text-foreground">
                                {order.packageName} ({order.capacity})
                              </span>
                            </div>
                            <div className="flex justify-between p-3 rounded-lg border border-border">
                              <span className="text-muted-foreground">Amount</span>
                              <span className="font-bold text-foreground">Rs. {order.amount.toLocaleString()}</span>
                            </div>
                          </div>
                          <DialogFooter className="gap-2">
                            {order.status === "installation_pending" && (
                              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                                Start Installation
                              </Button>
                            )}
                            {order.status === "in_progress" && (
                              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                                Mark as Complete
                              </Button>
                            )}
                            {order.status === "completed" && (
                              <Button variant="outline" className="w-full bg-transparent">
                                Download Report
                              </Button>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
