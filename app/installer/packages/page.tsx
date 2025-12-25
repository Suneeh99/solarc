"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, Edit, Trash2, Eye, EyeOff, Zap } from "lucide-react"
import { fetchCurrentUser, fetchInstallers, type SolarPackage } from "@/lib/auth"

export default function InstallerPackages() {
  const [packages, setPackages] = useState<(SolarPackage & { active?: boolean; sales?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadPackages() {
      try {
        const user = await fetchCurrentUser()
        const installers = await fetchInstallers(false)
        const installer = installers.find((inst) => inst.id === user?.organization?.id)
        if (installer) {
          setPackages(installer.packages.map((pkg) => ({ ...pkg, active: true, sales: pkg.price / 10000 })))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load packages")
      } finally {
        setLoading(false)
      }
    }
    loadPackages()
  }, [])

  const togglePackageStatus = (id: string) => {
    setPackages(packages.map((pkg) => (pkg.id === id ? { ...pkg, active: !pkg.active } : pkg)))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Packages</h1>
            <p className="text-muted-foreground">Manage your solar installation packages</p>
          </div>
          <Link href="/installer/packages/new">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </Link>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="py-12 text-center text-muted-foreground">Loading packages...</CardContent>
            </Card>
          ) : packages.length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="py-12 text-center text-muted-foreground">No packages yet.</CardContent>
            </Card>
          ) : (
            packages.map((pkg) => (
            <Card key={pkg.id} className={pkg.active ? "" : "opacity-60"}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg text-foreground">{pkg.name}</CardTitle>
                    {!pkg.active && (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{pkg.capacity} System</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Package
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => togglePackageStatus(pkg.id)}>
                      {pkg.active ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">Rs. {pkg.price.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{pkg.sales ?? 0} sales</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Panels</span>
                    <span className="text-foreground">
                      {pkg.panelCount}x {pkg.panelType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inverter</span>
                    <span className="text-foreground">{pkg.inverterBrand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Warranty</span>
                    <span className="text-foreground">{pkg.warranty}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-2">Included:</p>
                  <div className="flex flex-wrap gap-1">
                    {pkg.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-muted">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            ))
          )}

          {/* Add Package Card */}
          <Card className="border-dashed flex items-center justify-center min-h-[300px]">
            <Link href="/installer/packages/new" className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">Create New Package</p>
              <p className="text-sm text-muted-foreground">Add a new solar installation package</p>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
