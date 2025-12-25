"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sun,
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Building,
  Gavel,
  Receipt,
  ClipboardList,
  BarChart3,
  CheckCircle,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchCurrentUser, logout, type User, type UserRole } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { NotificationProvider, NotificationBell } from "@/components/notifications"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navigationByRole: Record<UserRole, NavItem[]> = {
  customer: [
    { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    { label: "My Applications", href: "/customer/applications", icon: FileText },
    { label: "Find Installer", href: "/customer/installers", icon: Building },
    { label: "My Bids", href: "/customer/bids", icon: Gavel },
    { label: "Invoices", href: "/customer/invoices", icon: Receipt },
    { label: "Reports", href: "/customer/reports", icon: BarChart3 },
  ],
  installer: [
    { label: "Dashboard", href: "/installer/dashboard", icon: LayoutDashboard },
    { label: "My Packages", href: "/installer/packages", icon: Package },
    { label: "Bid Requests", href: "/installer/bids", icon: Gavel },
    { label: "Orders", href: "/installer/orders", icon: ClipboardList },
    { label: "Reports", href: "/installer/reports", icon: BarChart3 },
  ],
  officer: [
    { label: "Dashboard", href: "/officer/dashboard", icon: LayoutDashboard },
    { label: "Applications", href: "/officer/applications", icon: FileText },
    { label: "Installers", href: "/officer/installers", icon: Building },
    { label: "Site Visits", href: "/officer/site-visits", icon: Calendar },
    { label: "Payments", href: "/officer/payments", icon: Receipt },
    { label: "Installations", href: "/officer/installations", icon: CheckCircle },
    { label: "Billing", href: "/officer/billing", icon: BarChart3 },
    { label: "Users", href: "/officer/users", icon: Users },
  ],
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchCurrentUser().then((currentUser) => {
      if (cancelled) return
      if (!currentUser) {
        router.push("/login")
        return
      }
      setUser(currentUser)
    })
    return () => {
      cancelled = true
    }
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const navigation = navigationByRole[user.role]
  const roleColors = {
    customer: "bg-emerald-500",
    installer: "bg-amber-500",
    officer: "bg-blue-500",
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", roleColors[user.role])}>
                  <Sun className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-foreground">CEB Solar</span>
              </Link>
              <button
                className="lg:hidden text-muted-foreground hover:text-foreground"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* User info */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className={cn("text-white", roleColors[user.role])}>
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-background border-b border-border">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                className="lg:hidden text-muted-foreground hover:text-foreground"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 ml-auto">
                <NotificationBell />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={cn("text-white text-xs", roleColors[user.role])}>
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline text-sm">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </NotificationProvider>
  )
}
