"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Zap, Search, CheckCircle, Clock, TrendingUp, TrendingDown, FileText, Download } from "lucide-react"
import { getDemoMonthlyBills, getDemoInvoices } from "@/lib/auth"

const meterReadings = [
  {
    id: "MR-001",
    customerId: "CUST-001",
    customerName: "John Smith",
    address: "123 Solar Lane, Colombo 07",
    accountNumber: "0712345678",
    lastReading: 4520,
    currentReading: 4890,
    unitsConsumed: 370,
    unitsGenerated: 420,
    netUnits: -50,
    readingDate: "2024-01-15",
    status: "pending",
  },
  {
    id: "MR-002",
    customerId: "CUST-002",
    customerName: "Sarah Wilson",
    address: "456 Green Street, Colombo 03",
    accountNumber: "0723456789",
    lastReading: 3200,
    currentReading: 3580,
    unitsConsumed: 380,
    unitsGenerated: 350,
    netUnits: 30,
    readingDate: "2024-01-15",
    status: "pending",
  },
  {
    id: "MR-003",
    customerId: "CUST-003",
    customerName: "Mike Johnson",
    address: "789 Beach Road, Galle",
    accountNumber: "0734567890",
    lastReading: 2100,
    currentReading: 2450,
    unitsConsumed: 350,
    unitsGenerated: 480,
    netUnits: -130,
    readingDate: "2024-01-14",
    status: "verified",
  },
]

export default function OfficerMeterReadings() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReading, setSelectedReading] = useState<(typeof meterReadings)[0] | null>(null)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState("")
  const monthlyBills = getDemoMonthlyBills()
  const invoices = getDemoInvoices()
  const billPreview = selectedReading ? monthlyBills.find((bill) => bill.meterReadingId === selectedReading.id) : null
  const billInvoice = billPreview ? invoices.find((invoice) => invoice.id === billPreview.invoiceId) : null

  const filteredReadings = meterReadings.filter(
    (r) =>
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.accountNumber.includes(searchTerm) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingCount = meterReadings.filter((r) => r.status === "pending").length
  const verifiedCount = meterReadings.filter((r) => r.status === "verified").length

  const handleVerify = () => {
    alert(`Reading ${selectedReading?.id} verified successfully!`)
    setShowVerifyDialog(false)
    setSelectedReading(null)
    setVerificationNotes("")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meter Readings</h1>
          <p className="text-muted-foreground">Verify and manage solar meter readings</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Readings</p>
                  <p className="text-2xl font-bold text-foreground">{meterReadings.length}</p>
                </div>
                <Zap className="w-8 h-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-cyan-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold text-foreground">{verifiedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Export</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {meterReadings.reduce((sum, r) => sum + Math.max(0, -r.netUnits), 0)} kWh
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-foreground">Meter Readings</CardTitle>
                <CardDescription>Review and verify customer meter readings</CardDescription>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Account</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Consumed</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Generated</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Net</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReadings.map((reading) => (
                    <tr key={reading.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{reading.customerName}</p>
                        <p className="text-xs text-muted-foreground">{reading.address}</p>
                      </td>
                      <td className="py-3 px-4 text-foreground">{reading.accountNumber}</td>
                      <td className="py-3 px-4 text-right text-foreground">{reading.unitsConsumed} kWh</td>
                      <td className="py-3 px-4 text-right text-emerald-500">{reading.unitsGenerated} kWh</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 ${reading.netUnits < 0 ? "text-emerald-500" : "text-amber-500"}`}
                        >
                          {reading.netUnits < 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {Math.abs(reading.netUnits)} kWh
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          className={
                            reading.status === "verified"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600"
                          }
                          variant="secondary"
                        >
                          {reading.status === "verified" ? "Verified" : "Pending"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {reading.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedReading(reading)
                              setShowVerifyDialog(true)
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Verify
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {showVerifyDialog && selectedReading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-foreground">Verify Meter Reading</CardTitle>
                <CardDescription>Confirm the reading for {selectedReading.customerName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Previous Reading</p>
                    <p className="text-lg font-bold text-foreground">{selectedReading.lastReading}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Reading</p>
                    <p className="text-lg font-bold text-foreground">{selectedReading.currentReading}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Units Consumed</p>
                    <p className="text-lg font-bold text-amber-500">{selectedReading.unitsConsumed} kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Units Generated</p>
                    <p className="text-lg font-bold text-emerald-500">{selectedReading.unitsGenerated} kWh</p>
                  </div>
                </div>
                {billPreview && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-emerald-700">Billing outcome</p>
                      <Badge className="bg-emerald-600 text-white" variant="secondary">
                        {billPreview.status === "paid" ? "Credit issued" : "Invoice queued"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monthly bill</span>
                      <span className="font-semibold text-foreground">{billPreview.id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className={billPreview.amount < 0 ? "text-emerald-600 font-semibold" : "text-foreground font-semibold"}>
                        {billPreview.amount < 0 ? "+" : ""}LKR {Math.abs(billPreview.amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {billPreview.invoiceId && (
                        <Link href={`/customer/invoices/${billPreview.invoiceId}`} className="text-emerald-700 hover:underline">
                          View invoice {billPreview.invoiceId}
                        </Link>
                      )}
                      {billInvoice?.pdfUrl && (
                        <a href={billInvoice.pdfUrl} download className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                          <Download className="w-4 h-4" />
                          Download PDF
                        </a>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Verification Notes (Optional)
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className="w-full h-20 p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Add any notes..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowVerifyDialog(false)
                      setSelectedReading(null)
                    }}
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleVerify} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Reading
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
