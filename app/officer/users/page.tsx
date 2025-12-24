"use client"

import { useState } from "react"
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

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  role: "customer" | "installer" | "officer"
  status: "active" | "inactive" | "suspended"
  createdAt: string
  lastLogin?: string
  applications?: number
  installations?: number
}

const demoUsers: UserData[] = [
  {
    id: "USR-001",
    name: "John Silva",
    email: "john.silva@email.com",
    phone: "+94 77 123 4567",
    role: "customer",
    status: "active",
    createdAt: "2024-01-01",
    lastLogin: "2024-01-20",
    applications: 2,
  },
  {
    id: "USR-002",
    name: "Maria Fernando",
    email: "maria.f@email.com",
    phone: "+94 71 234 5678",
    role: "customer",
    status: "active",
    createdAt: "2024-01-05",
    lastLogin: "2024-01-19",
    applications: 1,
  },
  {
    id: "USR-003",
    name: "SunPower Systems",
    email: "info@sunpower.lk",
    phone: "+94 11 234 5678",
    role: "installer",
    status: "active",
    createdAt: "2023-12-15",
    lastLogin: "2024-01-20",
    installations: 15,
  },
  {
    id: "USR-004",
    name: "Green Solar Co",
    email: "contact@greensolar.lk",
    phone: "+94 11 345 6789",
    role: "installer",
    status: "active",
    createdAt: "2023-11-20",
    lastLogin: "2024-01-18",
    installations: 22,
  },
  {
    id: "USR-005",
    name: "David Perera",
    email: "david.p@email.com",
    phone: "+94 76 345 6789",
    role: "customer",
    status: "suspended",
    createdAt: "2024-01-10",
    applications: 0,
  },
  {
    id: "USR-006",
    name: "Officer Admin",
    email: "admin@ceb.lk",
    phone: "+94 11 456 7890",
    role: "officer",
    status: "active",
    createdAt: "2023-01-01",
    lastLogin: "2024-01-20",
  },
]

export default function OfficerUsersPage() {
  const [users, setUsers] = useState<UserData[]>(demoUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"suspend" | "activate">("suspend")

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
          onClick={() => {
            setSelectedUser(user)
            setDetailsOpen(true)
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user.status === "active" ? (
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(user)
                  setActionType("suspend")
                  setActionDialogOpen(true)
                }}
                className="text-red-600"
              >
                <Ban className="w-4 h-4 mr-2" />
                Suspend User
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(user)
                  setActionType("activate")
                  setActionDialogOpen(true)
                }}
                className="text-emerald-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage customers, installers, and system users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold text-emerald-600">{customers.length}</p>
                </div>
                <Users className="w-8 h-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Installers</p>
                  <p className="text-2xl font-bold text-amber-600">{installers.length}</p>
                </div>
                <Building className="w-8 h-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Officers</p>
                  <p className="text-2xl font-bold text-blue-600">{officers.length}</p>
                </div>
                <Shield className="w-8 h-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Suspended</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter((u) => u.status === "suspended").length}
                  </p>
                </div>
                <UserX className="w-8 h-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="customers">
          <TabsList className="bg-muted">
            <TabsTrigger value="customers">Customers ({customers.length})</TabsTrigger>
            <TabsTrigger value="installers">Installers ({installers.length})</TabsTrigger>
            <TabsTrigger value="officers">Officers ({officers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="mt-4 space-y-3">
            {filteredUsers(customers).map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </TabsContent>

          <TabsContent value="installers" className="mt-4 space-y-3">
            {filteredUsers(installers).map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </TabsContent>

          <TabsContent value="officers" className="mt-4 space-y-3">
            {filteredUsers(officers).map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </TabsContent>
        </Tabs>

        {/* User Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback
                      className={`text-white text-xl ${
                        selectedUser.role === "customer"
                          ? "bg-emerald-500"
                          : selectedUser.role === "installer"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                      }`}
                    >
                      {selectedUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-bold text-foreground">{selectedUser.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(selectedUser.role)}
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">Joined: {selectedUser.createdAt}</span>
                  </div>
                  {selectedUser.lastLogin && (
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Last login: {selectedUser.lastLogin}</span>
                    </div>
                  )}
                </div>

                {selectedUser.role === "customer" && selectedUser.applications !== undefined && (
                  <div className="p-4 bg-emerald-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Applications</p>
                    <p className="text-2xl font-bold text-emerald-600">{selectedUser.applications}</p>
                  </div>
                )}

                {selectedUser.role === "installer" && selectedUser.installations !== undefined && (
                  <div className="p-4 bg-amber-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Completed Installations</p>
                    <p className="text-2xl font-bold text-amber-600">{selectedUser.installations}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Action Confirmation Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{actionType === "suspend" ? "Suspend User" : "Activate User"}</DialogTitle>
              <DialogDescription>
                {actionType === "suspend"
                  ? "This will prevent the user from accessing the system."
                  : "This will restore the user's access to the system."}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium text-foreground">{selectedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                className={
                  actionType === "suspend" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
                }
              >
                {actionType === "suspend" ? (
                  <>
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
