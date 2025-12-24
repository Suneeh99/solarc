"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, CheckCircle, Clock, Zap, CreditCard, TrendingUp } from "lucide-react"

const billingRecords = [
  {
    id: "BILL-001",
    customerId: "CUST-001",
    customerName: "John Smith",
    accountNumber: "0712345678",
    period: "January 2024",
    unitsConsumed: 370,
    unitsGenerated: 420,
    netUnits: -50,
    amountDue: 0,
    credit: 1250,
    status: "credit",
    dueDate: "2024-02-15",
  },
  {
    id: "BILL-002",
    customerId: "CUST-002",
    customerName: "Sarah Wilson",
    accountNumber: "0723456789",
    period: "January 2024",
    unitsConsumed: 380,
    unitsGenerated: 350,
    netUnits: 30,
    amountDue: 750,
    credit: 0,
    status: "pending",
    dueDate: "2024-02-15",
  },
  {
    id: "BILL-003",
    customerId: "CUST-003",
    customerName: "Mike Johnson",
    accountNumber: "0734567890",
    period: "January 2024",
    unitsConsumed: 350,
    unitsGenerated: 480,
    netUnits: -130,
    amountDue: 0,
    credit: 3250,
    status: "credit",
    dueDate: "2024-02-15",
  },
  {
    id: "BILL-004",
    customerId: "CUST-004",
    customerName: "Emma Davis",
    accountNumber: "0745678901",
    period: "January 2024",
    unitsConsumed: 420,
    unitsGenerated: 390,
    netUnits: 30,
    amountDue: 750,
    credit: 0,
    status: "paid",
    dueDate: "2024-02-15",
  },
]

export default function OfficerBillingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredRecords = billingRecords.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || r.accountNumber.includes(searchTerm)
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && r.status === "pending") ||
      (activeTab === "credit" && r.status === "credit") ||
      (activeTab === "paid" && r.status === "paid")
    return matchesSearch && matchesTab
  })

  const totalCredits = billingRecords.filter((r) => r.status === "credit").reduce((sum, r) => sum + r.credit, 0)
  const totalPending = billingRecords.filter((r) => r.status === "pending").reduce((sum, r) => sum + r.amountDue, 0)
  const totalNetExport = billingRecords.reduce((sum, r) => sum + Math.max(0, -r.netUnits), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing Management</h1>
            <p className="text-muted-foreground">Manage net metering bills and customer credits</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold text-foreground">{billingRecords.length}</p>
                </div>
                <CreditCard className="w-8 h-8 text-cyan-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Credits</p>
                  <p className="text-2xl font-bold text-emerald-500">LKR {totalCredits.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Collection</p>
                  <p className="text-2xl font-bold text-amber-500">LKR {totalPending.toLocaleString()}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Grid Export</p>
                  <p className="text-2xl font-bold text-foreground">{totalNetExport} kWh</p>
                </div>
                <Zap className="w-8 h-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-foreground">Billing Records</CardTitle>
                <CardDescription>Net metering billing for January 2024</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({billingRecords.length})</TabsTrigger>
                <TabsTrigger value="credit">
                  Credits ({billingRecords.filter((r) => r.status === "credit").length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({billingRecords.filter((r) => r.status === "pending").length})
                </TabsTrigger>
                <TabsTrigger value="paid">
                  Paid ({billingRecords.filter((r) => r.status === "paid").length})
                </TabsTrigger>
              </TabsList>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Consumed</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Generated</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Net</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <p className="font-medium text-foreground">{record.customerName}</p>
                          <p className="text-xs text-muted-foreground">{record.accountNumber}</p>
                        </td>
                        <td className="py-3 px-2 text-right text-foreground">{record.unitsConsumed} kWh</td>
                        <td className="py-3 px-2 text-right text-emerald-500">{record.unitsGenerated} kWh</td>
                        <td className="py-3 px-2 text-right">
                          <span className={record.netUnits < 0 ? "text-emerald-500" : "text-amber-500"}>
                            {record.netUnits < 0 ? "+" : ""}
                            {Math.abs(record.netUnits)} kWh
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          {record.status === "credit" ? (
                            <span className="text-emerald-500">+LKR {record.credit.toLocaleString()}</span>
                          ) : (
                            <span className="text-foreground">LKR {record.amountDue.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge
                            className={
                              record.status === "credit"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : record.status === "paid"
                                  ? "bg-cyan-500/10 text-cyan-600"
                                  : "bg-amber-500/10 text-amber-600"
                            }
                            variant="secondary"
                          >
                            {record.status === "credit" ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : record.status === "paid" ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {record.status === "credit" ? "Credit" : record.status === "paid" ? "Paid" : "Pending"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
