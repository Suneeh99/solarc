"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Package, Plus, X } from "lucide-react"

const commonFeatures = [
  "Free installation",
  "Net metering setup",
  "Monitoring system",
  "Battery backup option",
  "24/7 support",
  "Annual maintenance",
]

export default function NewPackage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customFeature, setCustomFeature] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    panelCount: "",
    panelType: "",
    panelBrand: "",
    inverterType: "",
    inverterBrand: "",
    warrantyYears: "",
    price: "",
    description: "",
    installationDays: "",
    features: [] as string[],
  })

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }))
  }

  const addCustomFeature = () => {
    if (customFeature.trim() && !formData.features.includes(customFeature.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, customFeature.trim()],
      }))
      setCustomFeature("")
    }
  }

  const removeFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      router.push("/installer/packages?success=true")
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/installer/packages">
            <Button variant="ghost" size="icon" className="bg-transparent">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Package</h1>
            <p className="text-muted-foreground">Add a new solar installation package for customers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                Package Information
              </CardTitle>
              <CardDescription>Basic details about your solar package</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Premium Solar Package"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">System Capacity</Label>
                  <Select
                    value={formData.capacity}
                    onValueChange={(value) => setFormData({ ...formData, capacity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select capacity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 kW</SelectItem>
                      <SelectItem value="3">3 kW</SelectItem>
                      <SelectItem value="5">5 kW</SelectItem>
                      <SelectItem value="10">10 kW</SelectItem>
                      <SelectItem value="15">15 kW</SelectItem>
                      <SelectItem value="20">20 kW+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your package, its benefits, and what's included..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (LKR)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 450000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="installationDays">Installation Time (days)</Label>
                  <Input
                    id="installationDays"
                    type="number"
                    placeholder="e.g., 3"
                    value={formData.installationDays}
                    onChange={(e) => setFormData({ ...formData, installationDays: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Specs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Technical Specifications</CardTitle>
              <CardDescription>Details about the solar equipment included</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="panelCount">Number of Panels</Label>
                  <Input
                    id="panelCount"
                    type="number"
                    placeholder="e.g., 12"
                    value={formData.panelCount}
                    onChange={(e) => setFormData({ ...formData, panelCount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Panel Type</Label>
                  <Select
                    value={formData.panelType}
                    onValueChange={(value) => setFormData({ ...formData, panelType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monocrystalline">Monocrystalline</SelectItem>
                      <SelectItem value="polycrystalline">Polycrystalline</SelectItem>
                      <SelectItem value="thin_film">Thin Film</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panelBrand">Panel Brand</Label>
                  <Input
                    id="panelBrand"
                    placeholder="e.g., JA Solar"
                    value={formData.panelBrand}
                    onChange={(e) => setFormData({ ...formData, panelBrand: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Inverter Type</Label>
                  <Select
                    value={formData.inverterType}
                    onValueChange={(value) => setFormData({ ...formData, inverterType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String Inverter</SelectItem>
                      <SelectItem value="micro">Microinverter</SelectItem>
                      <SelectItem value="hybrid">Hybrid Inverter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inverterBrand">Inverter Brand</Label>
                  <Input
                    id="inverterBrand"
                    placeholder="e.g., Huawei"
                    value={formData.inverterBrand}
                    onChange={(e) => setFormData({ ...formData, inverterBrand: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyYears">Warranty (years)</Label>
                  <Input
                    id="warrantyYears"
                    type="number"
                    placeholder="e.g., 10"
                    value={formData.warrantyYears}
                    onChange={(e) => setFormData({ ...formData, warrantyYears: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Package Features</CardTitle>
              <CardDescription>Select or add features included in this package</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={formData.features.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    <label htmlFor={feature} className="text-sm text-foreground cursor-pointer">
                      {feature}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom feature..."
                  value={customFeature}
                  onChange={(e) => setCustomFeature(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomFeature())}
                />
                <Button type="button" variant="outline" onClick={addCustomFeature} className="bg-transparent">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-sm"
                    >
                      {feature}
                      <button type="button" onClick={() => removeFeature(feature)} className="hover:text-amber-700">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/installer/packages">
              <Button variant="outline" className="bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white" disabled={loading}>
              {loading ? "Creating..." : "Create Package"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
