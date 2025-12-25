"use client"

import { useEffect, useMemo, useState } from "react"

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

import { fetchPayments, type Invoice, type MonthlyBill } from "@/lib/auth"

export default function CustomerInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [monthlyBills, setMonthlyBills] = useState<MonthlyBill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const payments = await fetchPayments()
        setInvoices(payments.invoices)
        setMonthlyBills(payments.monthlyBills)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load payments")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const summary = useMemo(() => {
    const pending = invoices
      .filter((inv) => inv.status === "pending")
      .reduce((sum, inv) => sum + inv.amount, 0)

    const paid = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.amount, 0)

    const credit = monthlyBills.reduce((sum, bill) => sum + bill.amount, 0)

    return { pending, paid, credit }
  }, [invoices, monthlyBills])

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

  const getTypeBadge = (type: Invoice["type"]) => {
    const styles: Record<Invoice["type"], string> = {
      authority_fee: "bg-purple-500/10 text-purple-600",
      installation: "bg-emerald-500/10 text-emerald-600",
      monthly_bill: "bg-blue-500/10 text-blue-600",
    }

    const labels: Record<Invoice["type"], string> = {
      authority_fee: "Authority Fee",
      installation: "Installation",
      monthly_bill: "Monthly Bill",
    }

    return (
      <Badge className={styles[type]} variant="secondary">
        {labels[type]}
      </Badge>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Invoices & Bills
          </h1>
          <p className="text-muted-foreground">
            Authority fees, installation payments, and net metering bills
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            label="Pending"
            value={summary.pending}
            icon={Clock}
            color="amber"
          />
          <SummaryCard
            label="Total Paid"
            value={summary.paid}
            icon={CheckCircle}
            color="emerald"
          />
          <SummaryCard
            label="Net Metering Credit"
            value={summary.credit}
            icon={Receipt}
            color="blue"
            credit
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invoices">
          <TabsList>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Bills</TabsTrigger>
          </TabsList>

          {/* Invoices */}
          <TabsContent value="invoices" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Invoices</CardTitle>
                <CardDescription>
                  Authority fees and installation milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading invoices...
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No invoices available
                  </div>
                ) : (
                  invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Receipt className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{invoice.id}</p>
                            {getStatusBadge(invoice.status)}
                            {getTypeBadge(invoice.type)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {invoice.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Due{" "}
                            {new Date(
                              invoice.dueDate,
                            ).toLocaleDateString()}
                            {invoice.paidAt &&
                              ` • Paid ${new Date(
                                invoice.paidAt,
                              ).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold">
                          Rs. {invoice.amount.toLocaleString()}
                        </p>
                        {invoice.status === "pending" ? (
                          <Button className="bg-emerald-500 text-white">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay Now
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monthly Bills */}
          <TabsContent value="monthly" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Energy Bills</CardTitle>
                <CardDescription>
                  Net metering statements from meter readings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading monthly bills...
                  </div>
                ) : monthlyBills.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No monthly bills available
                  </div>
                ) : (
                  monthlyBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="p-4 rounded-lg border"
                    >
                      <div className="flex justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {new Date(
                              bill.year,
                              bill.month - 1,
                            ).toLocaleString("default", {
                              month: "long",
                            })}{" "}
                            {bill.year}
                          </p>
                          {getStatusBadge(bill.status)}
                        </div>
                        <p
                          className={`text-lg font-bold ${
                            bill.amount < 0
                              ? "text-emerald-500"
                              : ""
                          }`}
                        >
                          {bill.amount < 0 ? "Credit: " : ""}
                          Rs. {Math.abs(bill.amount).toLocaleString()}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <Metric label="Generated" value={`${bill.kwhGenerated} kWh`} />
                        <Metric
                          label="Exported"
                          value={`${bill.kwhExported} kWh`}
                          accent="emerald"
                        />
                        <Metric
                          label="Imported"
                          value={`${bill.kwhImported} kWh`}
                          accent="amber"
                        />
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download Statement
                        </Button>
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

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  credit = false,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
  credit?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center`}
          >
            <Icon className={`w-6 h-6 text-${color}-500`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p
              className={`text-2xl font-bold ${
                credit ? "text-emerald-500" : ""
              }`}
            >
              Rs. {Math.abs(value).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: "emerald" | "amber"
}) {
  return (
    <div
      className={`p-3 rounded-lg ${
        accent === "emerald"
          ? "bg-emerald-500/10"
          : accent === "amber"
          ? "bg-amber-500/10"
          : "bg-muted/50"
      }`}
    >
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}
