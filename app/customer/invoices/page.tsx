"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { DashboardLayout } from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  Receipt,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  CreditCard,
} from "lucide-react"

import type { Invoice, MonthlyBill } from "@/lib/prisma-types"

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getStatusBadge(status: string) {
  switch (status) {
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
      return (
        <Badge className="bg-amber-500/10 text-amber-600" variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      )
  }
}

function getTypeBadge(type: Invoice["type"]) {
  const map: Record<Invoice["type"], string> = {
    authority_fee: "Authority Fee",
    installation: "Installation",
    monthly_bill: "Monthly Bill",
  }

  const styles: Record<Invoice["type"], string> = {
    authority_fee: "bg-purple-500/10 text-purple-600",
    installation: "bg-emerald-500/10 text-emerald-600",
    monthly_bill: "bg-blue-500/10 text-blue-600",
  }

  return (
    <Badge variant="secondary" className={styles[type]}>
      {map[type]}
    </Badge>
  )
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: React.ElementType
  tone: "amber" | "emerald" | "blue"
}) {
  const tones = {
    amber: "bg-amber-500/10 text-amber-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    blue: "bg-blue-500/10 text-blue-600",
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tones[tone]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">
              Rs. {Math.abs(value).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function CustomerInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [monthlyBills, setMonthlyBills] = useState<MonthlyBill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/payments?includeMonthly=true", {
          cache: "no-store",
        })

        if (!res.ok) throw new Error("Failed to load payments")

        const data = await res.json()
        setInvoices(data.invoices ?? [])
        setMonthlyBills(data.monthlyBills ?? [])
      } catch {
        setError("Unable to load invoices")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const summary = useMemo(() => {
    return {
      pending: invoices
        .filter((i) => i.status === "pending")
        .reduce((s, i) => s + i.amount, 0),
      paid: invoices
        .filter((i) => i.status === "paid")
        .reduce((s, i) => s + i.amount, 0),
      credit: monthlyBills
        .filter((b) => b.amount < 0)
        .reduce((s, b) => s + b.amount, 0),
    }
  }, [invoices, monthlyBills])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Invoices & Bills</h1>
          <p className="text-muted-foreground">
            Authority fees, installations, and net metering statements
          </p>
        </div>

        {error && (
          <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard label="Pending" value={summary.pending} icon={Clock} tone="amber" />
          <SummaryCard label="Paid" value={summary.paid} icon={CheckCircle} tone="emerald" />
          <SummaryCard label="Net Credit" value={summary.credit} icon={Receipt} tone="blue" />
        </div>

        <Tabs defaultValue="invoices">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Bills</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Payment requests and receipts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Loading invoices…
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No invoices available
                  </div>
                ) : (
                  invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Receipt className="w-6 h-6 text-blue-500" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{inv.id}</span>
                            {getStatusBadge(inv.status)}
                            {getTypeBadge(inv.type)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {inv.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4 sm:mt-0">
                        <span className="font-bold">
                          Rs. {inv.amount.toLocaleString()}
                        </span>
                        {inv.status === "pending" ? (
                          <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay
                          </Button>
                        ) : (
                          inv.pdfUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={inv.pdfUrl} download>
                                <Download className="w-4 h-4 mr-2" />
                                PDF
                              </a>
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Bills</CardTitle>
                <CardDescription>Net metering statements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-6 text-muted-foreground">
                    Loading bills…
                  </div>
                ) : monthlyBills.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No monthly bills
                  </div>
                ) : (
                  monthlyBills.map((bill) => (
                    <div key={bill.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between mb-3">
                        <span className="font-semibold">
                          {new Date(bill.year, bill.month - 1).toLocaleString("default", {
                            month: "long",
                          })}{" "}
                          {bill.year}
                        </span>
                        <span
                          className={`font-bold ${
                            bill.amount < 0 ? "text-emerald-600" : ""
                          }`}
                        >
                          Rs. {Math.abs(bill.amount).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Generated</p>
                          <p className="font-semibold">{bill.kwhGenerated} kWh</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Exported</p>
                          <p className="font-semibold text-emerald-600">
                            {bill.kwhExported} kWh
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Imported</p>
                          <p className="font-semibold text-amber-600">
                            {bill.kwhImported} kWh
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
