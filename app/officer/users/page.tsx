"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Users,
  Building,
  Shield,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Eye,
  Ban,
  CheckCircle,
} from "lucide-react"
import { fetchUsers, type User } from "@/lib/auth"

type UserData = User & { status: "active" | "inactive" | "suspended" }

export default function OfficerUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"suspend" | "activate">("suspend")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchUsers()
        setUsers(
          data.map((user) => ({
            ...user,
            status: user.verified === false ? "suspended" : "active",
          })),
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load users")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const customers = users.filter((u) => u.role === "customer")
  const installers = users.filter((u) => u.role === "installer")
  const officers = users.filter((u) => u.role === "officer")

  const getRoleBadge = (role: UserData["role"]) => {
    const config = {
      customer: { label: "Customer", color: "bg-emerald-500/10 text-emerald-600", icon: Users },
      installer: { label: "Installer", color: "bg-amber-500/10 text-amber-600", icon: Building },
      officer: { label: "Officer", color: "bg-blue-500/10 text-blue-600", icon: Shield },
    }
    const { label, color, icon: Icon } = config[role]
    return (
      <Badge className={color} variant="secondary">
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    )
  }

  const getStatusBadge = (status: UserData["status"]) => {
    const config = {
      active: { label: "Active", color: "bg-emerald-500/10 text-emerald-600" },
      inactive: { label: "Inactive", color: "bg-slate-500/10 text-slate-600" },
      suspended: { label: "Suspended", color: "bg-red-500/10 text-red-600" },
    }
    const { label, color } = config[status]
    return (
      <Badge className={color} variant="secondary">
        {label}
      </Badge>
    )
  }

  const handleAction = () => {
    if (selectedUser) {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, status: actionType === "suspend" ? "suspended" : "active" } : u,
        ),
      )
      setActionDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const filteredUsers = (list: UserData[]) =>
    list.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  const UserCard = ({ user }: { user: UserData }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-emerald-500/30 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar className="w-12 h-12">
          <AvatarFallback
            className={`text-white ${
              user.role === "customer" ? "bg-emerald-500" : user.role === "installer" ? "bg-amber-500" : "bg-blue-500"
            }`}
          >
            {user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">{user.name}</p>
            {getStatusBadge(user.status)}
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">ID: {user.id}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent"
          onClick={() => {
            setSelectedUser(user)
            setDetailsOpen(true)
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedUser(user)
                setActionType("activate")
                setActionDialogOpen(true)
              }}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Activate
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                setSelectedUser(user)
                setActionType("suspend")
                setActionDialogOpen(true)
              }}
            >
              <UserX className="w-4 h-4 mr-2" />
              Suspend
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage customers, installers, and officers</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>
        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customers</p>
                  <p className="text-lg font-bold text-foreground">{customers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Building className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Installers</p>
                  <p className="text-lg font-bold text-foreground">{installers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Officers</p>
                  <p className="text-lg font-bold text-foreground">{officers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="customers">
          <TabsList>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="installers">Installers</TabsTrigger>
            <TabsTrigger value="officers">Officers</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="mt-4 space-y-3">
            {loading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">Loading users...</CardContent>
              </Card>
            ) : (
              filteredUsers(customers).map((user) => <UserCard key={user.id} user={user} />)
            )}
          </TabsContent>
          <TabsContent value="installers" className="mt-4 space-y-3">
            {loading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">Loading users...</CardContent>
              </Card>
            ) : (
              filteredUsers(installers).map((user) => <UserCard key={user.id} user={user} />)
            )}
          </TabsContent>
          <TabsContent value="officers" className="mt-4 space-y-3">
            {loading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">Loading users...</CardContent>
              </Card>
            ) : (
              filteredUsers(officers).map((user) => <UserCard key={user.id} user={user} />)
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>Profile and activity for the selected user.</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-emerald-500 text-white">
                      {selectedUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{selectedUser.name}</p>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(selectedUser.role)}
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="text-foreground">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span className="text-foreground">{selectedUser.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-foreground">
                      Created: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  {selectedUser.organization && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="w-4 h-4" />
                      <span className="text-foreground">
                        {selectedUser.organization.name} {selectedUser.organization ? "(Org)" : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{actionType === "suspend" ? "Suspend User" : "Activate User"}</DialogTitle>
              <DialogDescription>
                {actionType === "suspend"
                  ? "Suspended users cannot access the portal until reactivated."
                  : "Activate this account to restore access."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAction} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {actionType === "suspend" ? "Suspend" : "Activate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
