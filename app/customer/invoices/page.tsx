"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Receipt, Clock, CheckCircle, AlertCircle, Download, CreditCard } from "lucide-react"

const demoInvoices = [
  {
    id: "INV-001",
    type: "authority_fee",
    description: "CEB Authority Fee",
    amount: 25000,
    status: "pending",
    createdAt: "2024-01-20",
    dueDate: "2024-02-03",
  },
  {
    id: "INV-002",
    type: "installation",
    description: "Solar Installation - Solar Pro Ltd",
    amount: 450000,
    status: "paid",
    createdAt: "2024-01-15",
    dueDate: "2024-01-22",
    paidAt: "2024-01-18",
  },
]

const demoMonthlyBills = [
  {
    id: "BILL-001",
    month: "January",
    year: 2024,
    kwhGenerated: 420,
    kwhExported: 280,
    kwhImported: 120,
    amount: -3200,
    status: "paid",
  },
  {
    id: "BILL-002",
    month: "December",
    year: 2023,
    kwhGenerated: 380,
    kwhExported: 240,
    kwhImported: 150,
    amount: -2100,
    status: "paid",
  },
]

export default function CustomerInvoices() {
  const [invoices] = useState(demoInvoices)
  const [monthlyBills] = useState(demoMonthlyBills)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600" variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "paid":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        )
      case "overdue":
        return (
          <Badge className="bg-red-500/10 text-red-600" variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Overdue
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
          <h1 className="text-2xl font-bold text-foreground">Invoices & Bills</h1>
          <p className="text-muted-foreground">View and manage your payments and monthly energy bills</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">Rs. 25,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold text-foreground">Rs. 450,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Metering Credit</p>
                  <p className="text-2xl font-bold text-emerald-500">Rs. 5,300</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invoices">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Bills</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Payment Invoices</CardTitle>
                <CardDescription>Authority fees and installation payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Receipt className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{invoice.id}</p>
                            {getStatusBadge(invoice.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{invoice.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                            {invoice.paidAt && ` • Paid: ${new Date(invoice.paidAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold text-foreground">Rs. {invoice.amount.toLocaleString()}</p>
                        {invoice.status === "pending" ? (
                          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Monthly Energy Bills</CardTitle>
                <CardDescription>Net metering statements and energy usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyBills.map((bill) => (
                    <div key={bill.id} className="p-4 rounded-lg border border-border">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <div className="flex items-center gap-2 mb-2 sm:mb-0">
                          <p className="font-semibold text-foreground">
                            {bill.month} {bill.year}
                          </p>
                          {getStatusBadge(bill.status)}
                        </div>
                        <p className={`text-lg font-bold ${bill.amount < 0 ? "text-emerald-500" : "text-foreground"}`}>
                          {bill.amount < 0 ? "Credit: " : ""}Rs. {Math.abs(bill.amount).toLocaleString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-muted-foreground">Generated</p>
                          <p className="font-semibold text-foreground">{bill.kwhGenerated} kWh</p>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-500/10">
                          <p className="text-muted-foreground">Exported</p>
                          <p className="font-semibold text-emerald-500">{bill.kwhExported} kWh</p>
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/10">
                          <p className="text-muted-foreground">Imported</p>
                          <p className="font-semibold text-amber-500">{bill.kwhImported} kWh</p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Download className="w-4 h-4 mr-2" />
                          Download Statement
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
