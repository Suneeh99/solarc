"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, CheckCircle, Clock, Zap, CreditCard, TrendingUp, FileText } from "lucide-react"
import { getDemoMonthlyBills, getDemoInvoices } from "@/lib/auth"

const monthlyBills = getDemoMonthlyBills()
const invoices = getDemoInvoices()

export default function OfficerBillingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const billingRecords = useMemo(
    () =>
      monthlyBills.map((bill) => ({
        ...bill,
        period: `${bill.month} ${bill.year}`,
        invoice: invoices.find((inv) => inv.id === bill.invoiceId),
        isCredit: bill.amount < 0,
      })),
    [],
  )

  const filteredRecords = billingRecords.filter((r) => {
    const matchesSearch =
      r.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.invoice?.id || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && r.status === "pending") ||
      (activeTab === "credit" && r.isCredit) ||
      (activeTab === "paid" && r.status === "paid")
    return matchesSearch && matchesTab
  })

  const totalCredits = billingRecords.filter((r) => r.isCredit).reduce((sum, r) => sum + Math.abs(r.amount), 0)
  const totalPending = billingRecords.filter((r) => r.status === "pending").reduce((sum, r) => sum + r.amount, 0)
  const totalNetExport = billingRecords.reduce((sum, r) => sum + Math.max(0, r.kwhExported - r.kwhImported), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing Management</h1>
            <p className="text-muted-foreground">
              Generate invoices from payment events and monthly meter readings
            </p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="w-4 h-4 mr-2" />
            Export Summary
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Monthly Bills</p>
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
                <CardDescription>
                  Monthly bills generated from meter readings and pushed to customer invoices
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by application or invoice..."
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
                <TabsTrigger value="credit">Credits ({billingRecords.filter((r) => r.isCredit).length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({billingRecords.filter((r) => r.status === "pending").length})</TabsTrigger>
                <TabsTrigger value="paid">Paid ({billingRecords.filter((r) => r.status === "paid").length})</TabsTrigger>
              </TabsList>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Application</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Period</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Meter Reading</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Net</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <p className="font-medium text-foreground">{record.applicationId}</p>
                          <p className="text-xs text-muted-foreground">Customer {record.customerId}</p>
                        </td>
                        <td className="py-3 px-2 text-foreground">{record.period}</td>
                        <td className="py-3 px-2 text-foreground">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            {record.meterReadingId}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={record.kwhExported - record.kwhImported >= 0 ? "text-emerald-500" : "text-amber-500"}>
                            {record.kwhExported - record.kwhImported >= 0 ? "+" : ""}
                            {record.kwhExported - record.kwhImported} kWh
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          {record.isCredit ? (
                            <span className="text-emerald-500">+LKR {Math.abs(record.amount).toLocaleString()}</span>
                          ) : (
                            <span className="text-foreground">LKR {record.amount.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {record.invoice ? (
                            <div className="flex flex-col gap-1">
                              <Link
                                href={`/customer/invoices/${record.invoice.id}`}
                                className="text-sm text-emerald-600 hover:underline"
                              >
                                {record.invoice.id}
                              </Link>
                              {record.invoice.pdfUrl && (
                                <a
                                  href={record.invoice.pdfUrl}
                                  download
                                  className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                  Download PDF
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Will generate on approval</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge
                            className={
                              record.isCredit
                                ? "bg-emerald-500/10 text-emerald-600"
                                : record.status === "paid"
                                  ? "bg-cyan-500/10 text-cyan-600"
                                  : "bg-amber-500/10 text-amber-600"
                            }
                            variant="secondary"
                          >
                            {record.isCredit ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : record.status === "paid" ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {record.isCredit ? "Credit" : record.status === "paid" ? "Paid" : "Pending"}
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
