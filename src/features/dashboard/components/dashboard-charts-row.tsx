import {
    getCandidateSourcesAction,
    getHiringFunnelAction,
    getMonthlyHiringAction,
} from '@/server/actions/dashboard'
import {
    LazyCandidateSourcesChart,
    LazyHiringFunnelChart,
    LazyMonthlyHiringChart,
} from '@/components/lazy-charts'

export async function DashboardChartsRow() {
  const [funnelResult, monthlyResult, sourcesResult] = await Promise.all([
    getHiringFunnelAction(),
    getMonthlyHiringAction(),
    getCandidateSourcesAction(),
  ])

  return (
    <section
      aria-label="Hiring charts and analytics"
      className="grid grid-cols-1 gap-4 lg:grid-cols-3"
    >
      <div className="lg:col-span-1">
        <LazyHiringFunnelChart data={funnelResult.success ? funnelResult.data : []} />
      </div>
      <div className="lg:col-span-1">
        <LazyMonthlyHiringChart data={monthlyResult.success ? monthlyResult.data : []} />
      </div>
      <div className="lg:col-span-1">
        <LazyCandidateSourcesChart data={sourcesResult.success ? sourcesResult.data : []} />
      </div>
    </section>
  )
}
