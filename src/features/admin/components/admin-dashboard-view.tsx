'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { OrgPlan } from '@prisma/client'
import { updateOrgPlanAction, toggleOrgSubscriptionAction } from '@/server/actions/admin'
import {
  Building2,
  Briefcase,
  Users2,
  DollarSign,
  Search,
  Settings,
  CircleDot,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

interface OrganizationItem {
  id: string
  name: string
  slug: string
  plan: OrgPlan
  industry: string | null
  size: string | null
  createdAt: Date
  subscription: {
    status: string
    currentPeriodEnd: Date
  } | null
  _count: {
    users: number
    jobs: number
  }
}

interface AdminDashboardViewProps {
  stats: {
    totalOrgs: number
    totalJobs: number
    totalCandidates: number
    mrr: number
  }
  organizations: OrganizationItem[]
}

export function AdminDashboardView({ stats, organizations: initialOrgs }: AdminDashboardViewProps) {
  const router = useRouter()
  const [orgs, setOrgs] = useState<OrganizationItem[]>(initialOrgs)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const filteredOrgs = orgs.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase()) ||
    org.slug.toLowerCase().includes(search.toLowerCase())
  )

  async function handlePlanChange(orgId: string, newPlan: OrgPlan) {
    setUpdatingId(orgId)
    const toastId = toast.loading('Updating organization plan…')
    const result = await updateOrgPlanAction(orgId, newPlan)
    setUpdatingId(null)

    if (result.success) {
      toast.success('Organization plan updated.', { id: toastId })
      setOrgs(
        orgs.map((org) => (org.id === orgId ? { ...org, plan: newPlan } : org))
      )
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to update plan.', { id: toastId })
    }
  }

  async function handleStatusChange(orgId: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED') {
    setUpdatingId(orgId)
    const toastId = toast.loading('Updating subscription status…')
    const result = await toggleOrgSubscriptionAction(orgId, newStatus)
    setUpdatingId(null)

    if (result.success) {
      toast.success('Subscription status updated.', { id: toastId })
      setOrgs(
        orgs.map((org) =>
          org.id === orgId
            ? {
                ...org,
                subscription: org.subscription
                  ? { ...org.subscription, status: newStatus }
                  : { status: newStatus, currentPeriodEnd: new Date() },
              }
            : org
        )
      )
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to update status.', { id: toastId })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor platform metrics, manage active organizations, and toggle subscriptions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">
              Total Organizations
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrgs}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">
              Monthly Revenue (MRR)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.mrr}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">
              Active Job Posts
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">
              Registered Candidates
            </CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
          </CardContent>
        </Card>
      </div>

      {/* Organization Directory */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b space-y-0">
          <div>
            <CardTitle className="text-lg font-bold">Organization Management</CardTitle>
            <CardDescription>
              A directory of all companies onboarded to the SaaS platform.
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search companies…"
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/40 border-b text-muted-foreground font-medium">
                  <th className="p-4">Company</th>
                  <th className="p-4">Industry / Size</th>
                  <th className="p-4">Plan Tier</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Users / Jobs</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                      No organizations found.
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => {
                    const subStatus = org.subscription?.status ?? 'FREE'
                    return (
                      <tr key={org.id} className="hover:bg-muted/20">
                        <td className="p-4">
                          <div className="font-semibold text-foreground">{org.name}</div>
                          <div className="text-xs text-muted-foreground">/{org.slug}</div>
                        </td>
                        <td className="p-4">
                          <div>{org.industry ?? 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">Size: {org.size ?? 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <Select
                            value={org.plan}
                            onValueChange={(val) => handlePlanChange(org.id, val as OrgPlan)}
                            disabled={updatingId === org.id}
                          >
                            <SelectTrigger className="h-8 w-28 text-xs font-semibold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(OrgPlan).map((p) => (
                                <SelectItem key={p} value={p} className="text-xs font-medium">
                                  {p}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                subStatus === 'ACTIVE'
                                  ? 'bg-green-500'
                                  : subStatus === 'SUSPENDED'
                                  ? 'bg-red-500'
                                  : 'bg-yellow-500'
                              }`}
                            />
                            <span className="capitalize">{subStatus.toLowerCase()}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>Users: {org._count.users}</div>
                          <div className="text-xs text-muted-foreground">Jobs: {org._count.jobs}</div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <Select
                            value={subStatus}
                            onValueChange={(val) =>
                              handleStatusChange(org.id, val as 'ACTIVE' | 'SUSPENDED' | 'EXPIRED')
                            }
                            disabled={updatingId === org.id}
                          >
                            <SelectTrigger className="h-8 w-32 ml-auto text-xs">
                              <SelectValue placeholder="Manage Subscription" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Activate Sub</SelectItem>
                              <SelectItem value="SUSPENDED">Suspend Access</SelectItem>
                              <SelectItem value="EXPIRED">Mark Expired</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
