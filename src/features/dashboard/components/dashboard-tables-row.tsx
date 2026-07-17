import {
    getRecentApplicationsAction,
    getUpcomingInterviewsAction,
} from '@/server/actions/dashboard'
import { RecentApplicationsTable } from './recent-applications-table'
import { UpcomingInterviewsTable } from './upcoming-interviews-table'

export async function DashboardTablesRow() {
  const [applicationsResult, interviewsResult] = await Promise.all([
    getRecentApplicationsAction(),
    getUpcomingInterviewsAction(),
  ])

  return (
    <section
      aria-label="Recent activity"
      className="grid grid-cols-1 gap-4 lg:grid-cols-2"
    >
      <RecentApplicationsTable
        data={applicationsResult.success ? applicationsResult.data : []}
      />
      <UpcomingInterviewsTable
        data={interviewsResult.success ? interviewsResult.data : []}
      />
    </section>
  )
}
