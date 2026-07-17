import { AdminDashboardView } from '@/features/admin/components/admin-dashboard-view'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Super Admin — HireTrack AI',
  description: 'Manage platforms subscription, organizations, and feature metrics.',
}

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/')
  }

  // 1. Fetch Metrics
  const totalOrgs = await db.organization.count()
  const totalJobs = await db.job.count({
    where: {
      status: 'OPEN',
      deletedAt: null,
    },
  })
  const totalCandidates = await db.user.count({
    where: {
      role: 'CANDIDATE',
    },
  })

  const activeSubscriptions = await db.subscription.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      plan: true,
    },
  })

  const mrr = activeSubscriptions.reduce((acc, curr) => acc + (curr.plan?.monthlyPrice ?? 0), 0)

  // 2. Fetch Organizations list
  const organizations = await db.organization.findMany({
    include: {
      subscription: {
        select: {
          status: true,
          currentPeriodEnd: true,
        },
      },
      _count: {
        select: {
          users: true,
          jobs: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="container mx-auto py-8 max-w-6xl px-4">
      <AdminDashboardView
        stats={{
          totalOrgs,
          totalJobs,
          totalCandidates,
          mrr,
        }}
        organizations={organizations}
      />
    </div>
  )
}
