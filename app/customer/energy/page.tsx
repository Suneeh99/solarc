"use client"

import type { MonthlyBillingSummary, MeterReading } from "@/lib/data/meter-readings"
import { Badge } from "@/components/ui/badge"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, TrendingUp, Sun, Leaf, DollarSign, Loader2, AlertCircle } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts"

type DashboardResponse = {
  readings: MeterReading[]
  monthly: MonthlyBillingSummary[]
  totals: {
    kWhGenerated: number
    kWhExported: number
    kWhImported: number
    netKWh: number
    amountDue: number
    credit: number
  }
}

const DEFAULT_DASHBOARD: DashboardResponse = {
  readings: [],
  monthly: [],
  totals: {
    kWhGenerated: 0,
    kWhExported: 0,
    kWhImported: 0,
    netKWh: 0,
    amountDue: 0,
    credit: 0,
  },
}

const CUSTOMER_ID = "CUST-001"

export default function EnergyPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse>(DEFAULT_DASHBOARD)
  const [period, setPeriod] = useState("today")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch(`/api/iot/measurements?customerId=${CUSTOMER_ID}&limit=60`)
        if (!response.ok) {
          throw new Error("Unable to load meter readings")
        }
        const data: DashboardResponse = await response.json()
        setDashboard(data)
      } catch (err) {
        console.error(err)
        setError("We could not load your latest meter readings. Please try again in a moment.")
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const productionSeries = useMemo(
    () =>
      dashboard.readings
        .slice()
        .reverse()
        .map((reading) => ({
          time: new Date(reading.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          generated: Number(reading.kWhGenerated.toFixed(2)),
          exported: Number(reading.kWhExported.toFixed(2)),
        })),
    [dashboard.readings],
  )

  const monthlySeries = useMemo(
    () =>
      dashboard.monthly.map((summary) => ({
        month: `${summary.month} ${String(summary.year).slice(-2)}`,
        generated: Number(summary.kWhGenerated.toFixed(2)),
        imported: Number(summary.kWhImported.toFixed(2)),
        exported: Number(summary.kWhExported.toFixed(2)),
        savings: Math.max(summary.credit - summary.amountDue, 0),
        net: Number(summary.netKWh.toFixed(2)),
      })),
    [dashboard.monthly],
  )

  const displayedProduction = useMemo(() => {
    const limit = period === "today" ? 8 : period === "week" ? 14 : productionSeries.length
    return productionSeries.slice(-limit)
  }, [period, productionSeries])

  const co2Prevented = (dashboard.totals.kWhGenerated * 0.85).toFixed(0)
  const netBalance = dashboard.totals.credit - dashboard.totals.amountDue
  const recentReadings = dashboard.readings.slice(0, 6)
  const billingHighlight = dashboard.monthly.slice(-3).reverse()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Energy Dashboard</h1>
            <p className="text-muted-foreground">Monitor your solar energy production and consumption</p>
          </div>
          <div className="flex items-center gap-3">
            {loading && (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Syncing latest readings...
              </span>
            )}
            <div className="flex gap-2">
              <Button
                variant={period === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod("today")}
                className={period === "today" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-transparent"}
              >
                Today
              </Button>
              <Button
                variant={period === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod("week")}
                className={period === "week" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-transparent"}
              >
                Week
              </Button>
              <Button
                variant={period === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod("month")}
                className={period === "month" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-transparent"}
              >
                Month
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Generated</p>
                  <p className="text-2xl font-bold text-foreground">{dashboard.totals.kWhGenerated.toFixed(1)} kWh</p>
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Live from IoT meter
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Grid Export</p>
                  <p className="text-2xl font-bold text-emerald-500">{dashboard.totals.kWhExported.toFixed(1)} kWh</p>
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Verified device posts
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Balance</p>
                  <p className="text-2xl font-bold text-foreground">
                    {netBalance >= 0 ? `+LKR ${netBalance.toLocaleString()}` : `-LKR ${Math.abs(netBalance).toLocaleString()}`}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {netBalance >= 0 ? "Estimated credit" : "Estimated due"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-cyan-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{"CO\u2082 Prevented"}</p>
                  <p className="text-2xl font-bold text-foreground">{co2Prevented} kg</p>
                  <p className="text-xs text-muted-foreground">Environmental impact</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="production" className="space-y-4">
          <TabsList>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="consumption">Consumption</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
          </TabsList>

          <TabsContent value="production">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Energy Production</CardTitle>
                <CardDescription>Solar generation and grid export</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayedProduction} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit=" kWh" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="generated"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.25}
                        name="Generated"
                      />
                      <Area
                        type="monotone"
                        dataKey="exported"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.2}
                        name="Exported"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consumption">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Generation vs Consumption</CardTitle>
                <CardDescription>Based on verified device meter readings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit=" kWh" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Bar dataKey="generated" fill="#f59e0b" name="Generated" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="imported" fill="#06b6d4" name="Imported" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="exported" fill="#10b981" name="Exported" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="savings">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Monthly Savings</CardTitle>
                <CardDescription>Net billing credits from meter readings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlySeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        formatter={(value: number) => [`LKR ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, "Savings"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="savings"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", strokeWidth: 2 }}
                        name="Savings"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">System Status</CardTitle>
              <CardDescription>Current solar system performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Inverter Output</span>
                <span className="font-semibold text-emerald-500">{dashboard.readings[0]?.kWhGenerated.toFixed(1) ?? "-"} kWh</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Grid Export Today</span>
                <span className="font-semibold text-foreground">{dashboard.totals.kWhExported.toFixed(1)} kWh</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Grid Import Today</span>
                <span className="font-semibold text-foreground">{dashboard.totals.kWhImported.toFixed(1)} kWh</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Status</span>
                <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
                  IoT feed healthy
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Billing Impact</CardTitle>
              <CardDescription>Monthly bills calculated from meter readings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {billingHighlight.length === 0 && <p className="text-sm text-muted-foreground">No billing cycles yet.</p>}
              {billingHighlight.map((summary) => (
                <div key={`${summary.year}-${summary.month}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">{`${summary.month} ${summary.year}`}</p>
                    <p className="text-xs text-muted-foreground">
                      Net {summary.netKWh >= 0 ? `${summary.netKWh.toFixed(1)} kWh imported` : `${Math.abs(summary.netKWh).toFixed(1)} kWh exported`}
                    </p>
                  </div>
                  <div className="text-right">
                    {summary.credit > 0 ? (
                      <p className="text-sm font-semibold text-emerald-500">Credit LKR {summary.credit.toLocaleString()}</p>
                    ) : (
                      <p className="text-sm font-semibold text-foreground">Due LKR {summary.amountDue.toLocaleString()}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Gen {summary.kWhGenerated.toFixed(1)} | Exp {summary.kWhExported.toFixed(1)} | Imp {summary.kWhImported.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Meter Readings</CardTitle>
              <CardDescription>Latest data received from your device token</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentReadings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No readings received yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Generated</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Exported</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Imported</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Voltage</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Current</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReadings.map((reading) => (
                        <tr key={reading.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4 text-foreground">
                            <p className="font-medium">
                              {new Date(reading.timestamp).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">Device {reading.deviceId}</p>
                          </td>
                          <td className="py-3 px-4 text-right text-foreground">{reading.kWhGenerated.toFixed(1)} kWh</td>
                          <td className="py-3 px-4 text-right text-emerald-500">{reading.kWhExported.toFixed(1)} kWh</td>
                          <td className="py-3 px-4 text-right text-foreground">{reading.kWhImported.toFixed(1)} kWh</td>
                          <td className="py-3 px-4 text-right text-foreground">{reading.voltage?.toFixed(1) ?? "-"} V</td>
                          <td className="py-3 px-4 text-right text-foreground">{reading.current?.toFixed(1) ?? "-"} A</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription>Latest energy events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentReadings.length === 0 && <p className="text-sm text-muted-foreground">Waiting for device data.</p>}
              {recentReadings.map((reading) => {
                const exported = reading.kWhExported > 0
                const time = new Date(reading.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                return (
                  <div key={`${reading.id}-activity`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${exported ? "bg-emerald-500" : "bg-cyan-500"}`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {exported ? "Grid export recorded" : "Energy imported"}
                        </p>
                        <p className="text-xs text-muted-foreground">{time}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${exported ? "text-emerald-500" : "text-foreground"}`}>
                      {exported ? `${reading.kWhExported.toFixed(1)} kWh` : `${reading.kWhImported.toFixed(1)} kWh`}
                    </span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
