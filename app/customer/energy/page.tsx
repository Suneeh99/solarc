"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, TrendingUp, Sun, Leaf, DollarSign } from "lucide-react"
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

const dailyData = [
  { time: "6AM", generated: 0.2, consumed: 0.5, exported: 0 },
  { time: "8AM", generated: 1.5, consumed: 1.2, exported: 0.3 },
  { time: "10AM", generated: 3.8, consumed: 0.8, exported: 3.0 },
  { time: "12PM", generated: 4.5, consumed: 1.0, exported: 3.5 },
  { time: "2PM", generated: 4.2, consumed: 0.9, exported: 3.3 },
  { time: "4PM", generated: 2.8, consumed: 1.5, exported: 1.3 },
  { time: "6PM", generated: 0.8, consumed: 2.5, exported: 0 },
  { time: "8PM", generated: 0, consumed: 2.0, exported: 0 },
]

const monthlyData = [
  { month: "Jul", generated: 420, consumed: 380, exported: 120, savings: 15000 },
  { month: "Aug", generated: 450, consumed: 390, exported: 140, savings: 17000 },
  { month: "Sep", generated: 480, consumed: 400, exported: 160, savings: 19500 },
  { month: "Oct", generated: 520, consumed: 410, exported: 180, savings: 22000 },
  { month: "Nov", generated: 490, consumed: 420, exported: 150, savings: 18500 },
  { month: "Dec", generated: 460, consumed: 430, exported: 110, savings: 13500 },
  { month: "Jan", generated: 510, consumed: 400, exported: 170, savings: 21000 },
]

export default function EnergyPage() {
  const [period, setPeriod] = useState("today")

  const totalGenerated = monthlyData.reduce((sum, m) => sum + m.generated, 0)
  const totalExported = monthlyData.reduce((sum, m) => sum + m.exported, 0)
  const totalSavings = monthlyData.reduce((sum, m) => sum + m.savings, 0)
  const co2Prevented = (totalGenerated * 0.85).toFixed(0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Energy Dashboard</h1>
            <p className="text-muted-foreground">Monitor your solar energy production and consumption</p>
          </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Generated</p>
                  <p className="text-2xl font-bold text-foreground">{totalGenerated} kWh</p>
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +12% from last period
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
                  <p className="text-2xl font-bold text-emerald-500">{totalExported} kWh</p>
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +8% from last period
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
                  <p className="text-sm text-muted-foreground">Total Savings</p>
                  <p className="text-2xl font-bold text-foreground">LKR {totalSavings.toLocaleString()}</p>
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +15% from last period
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
                <CardDescription>Solar generation throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
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
                        fillOpacity={0.3}
                        name="Generated"
                      />
                      <Area
                        type="monotone"
                        dataKey="exported"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
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
                <CardDescription>Compare your solar generation with household consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
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
                      <Bar dataKey="consumed" fill="#06b6d4" name="Consumed" radius={[4, 4, 0, 0]} />
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
                <CardDescription>Track your electricity bill savings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
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
                        formatter={(value: number) => [`LKR ${value.toLocaleString()}`, "Savings"]}
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
                <span className="text-muted-foreground">System Capacity</span>
                <span className="font-semibold text-foreground">5 kW</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Current Output</span>
                <span className="font-semibold text-emerald-500">3.2 kW</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Efficiency</span>
                <span className="font-semibold text-foreground">94%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Status</span>
                <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">
                  Optimal
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription>Latest energy events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { time: "Today 2:30 PM", event: "Peak generation reached", value: "4.8 kW", type: "success" },
                { time: "Today 10:00 AM", event: "Grid export started", value: "2.5 kWh", type: "info" },
                { time: "Yesterday", event: "Daily generation", value: "18.5 kWh", type: "default" },
                { time: "Jan 20", event: "Monthly bill credit", value: "LKR 8,500", type: "success" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "success"
                          ? "bg-emerald-500"
                          : activity.type === "info"
                            ? "bg-cyan-500"
                            : "bg-muted-foreground"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.event}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${activity.type === "success" ? "text-emerald-500" : "text-foreground"}`}
                  >
                    {activity.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
