import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InterviewsGridSkeleton } from '@/features/interviews/components/interview-card-skeleton'
import { InterviewsCalendar } from '@/features/interviews/components/interviews-calendar'
import { InterviewsFilters } from '@/features/interviews/components/interviews-filters'
import { InterviewsList } from '@/features/interviews/components/interviews-list'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import {
  getInterviewersAction,
  getInterviewsAction,
  getSchedulableApplicationsAction,
} from '@/server/actions/interviews'
import { Calendar, LayoutGrid } from 'lucide-react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Interviews — HireTrack AI',
  description: 'Schedule, track and manage interviews across your hiring pipeline.',
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function InterviewsPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  if (!hasPermission(session.user.role, 'interviews:read')) {
    redirect('/dashboard')
  }

  const params = await searchParams

  type StatusLiteral =
    | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED' | 'ALL'
  type TypeLiteral =
    | 'PHONE' | 'VIDEO' | 'ONSITE' | 'TECHNICAL' | 'HR' | 'PANEL' | 'ALL'

  const VALID_STATUSES: StatusLiteral[] = [
    'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED', 'ALL',
  ]
  const VALID_TYPES: TypeLiteral[] = [
    'PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL', 'HR', 'PANEL', 'ALL',
  ]

  const rawStatus = typeof params.status === 'string' ? params.status : 'ALL'
  const rawType = typeof params.type === 'string' ? params.type : 'ALL'

  const rawFilters = {
    query: typeof params.query === 'string' ? params.query : undefined,
    status: (VALID_STATUSES.includes(rawStatus as StatusLiteral)
      ? rawStatus
      : 'ALL') as StatusLiteral,
    type: (VALID_TYPES.includes(rawType as TypeLiteral)
      ? rawType
      : 'ALL') as TypeLiteral,
    page: typeof params.page === 'string' ? Number(params.page) : 1,
    pageSize: 18,
    sortBy: (typeof params.sortBy === 'string' ? params.sortBy : 'scheduledAt') as
      | 'scheduledAt'
      | 'createdAt',
    sortOrder: (typeof params.sortOrder === 'string' ? params.sortOrder : 'asc') as
      | 'asc'
      | 'desc',
  }

  const canCreate = hasPermission(session.user.role, 'interviews:create')
  const canEdit = hasPermission(session.user.role, 'interviews:update')
  const canFeedback = hasPermission(session.user.role, 'interviews:feedback')
  const canDelete = hasPermission(session.user.role, 'interviews:delete')

  const [listResult, interviewersResult, applicationsResult] = await Promise.all([
    getInterviewsAction(rawFilters),
    canCreate ? getInterviewersAction() : Promise.resolve({ success: true as const, data: [] }),
    canCreate
      ? getSchedulableApplicationsAction()
      : Promise.resolve({ success: true as const, data: [] }),
  ])

  // For calendar: fetch all scheduled/upcoming without pagination limits
  const calendarResult = await getInterviewsAction({
    status: 'SCHEDULED',
    pageSize: 100,
    sortBy: 'scheduledAt',
    sortOrder: 'asc',
  })

  const initialData = listResult.success
    ? listResult.data
    : {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pageSize: 18,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      }

  const interviewers = interviewersResult.success ? interviewersResult.data : []
  const applications = applicationsResult.success ? applicationsResult.data : []
  const calendarInterviews = calendarResult.success ? calendarResult.data.data : []

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Interviews</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Schedule and track interviews across your hiring pipeline.
        </p>
      </div>

      {/* View tabs */}
      <Tabs defaultValue="list">
        <TabsList variant="line" className="mb-2">
          <TabsTrigger value="list" className="gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
            List
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0 space-y-4">
          {/* Filters */}
          <Suspense fallback={<div className="h-8 w-full animate-pulse rounded bg-muted" />}>
            <InterviewsFilters totalCount={initialData.pagination.total} />
          </Suspense>

          {/* List */}
          <Suspense fallback={<InterviewsGridSkeleton />}>
            <InterviewsList
              initialData={initialData}
              filters={rawFilters}
              interviewers={interviewers}
              applications={applications}
              canCreate={canCreate}
              canEdit={canEdit}
              canFeedback={canFeedback}
              canDelete={canDelete}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <InterviewsCalendar interviews={calendarInterviews} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
