'use client'

import dynamic from 'next/dynamic'
import { HiringFunnelChartSkeleton } from '@/features/dashboard/components/hiring-funnel-chart'
import { MonthlyHiringChartSkeleton } from '@/features/dashboard/components/monthly-hiring-chart'
import { CandidateSourcesChartSkeleton } from '@/features/dashboard/components/candidate-sources-chart'
import { AnalyticsTrendsChartSkeleton } from '@/features/analytics/components/analytics-trends-chart'
import { AnalyticsInterviewStatsSkeleton } from '@/features/analytics/components/analytics-interview-stats'

export const LazyHiringFunnelChart = dynamic(
  () => import('@/features/dashboard/components/hiring-funnel-chart').then((m) => m.HiringFunnelChart),
  { ssr: false, loading: () => <HiringFunnelChartSkeleton /> }
)

export const LazyMonthlyHiringChart = dynamic(
  () => import('@/features/dashboard/components/monthly-hiring-chart').then((m) => m.MonthlyHiringChart),
  { ssr: false, loading: () => <MonthlyHiringChartSkeleton /> }
)

export const LazyCandidateSourcesChart = dynamic(
  () => import('@/features/dashboard/components/candidate-sources-chart').then((m) => m.CandidateSourcesChart),
  { ssr: false, loading: () => <CandidateSourcesChartSkeleton /> }
)

export const LazyAnalyticsTrendsChart = dynamic(
  () => import('@/features/analytics/components/analytics-trends-chart').then((m) => m.AnalyticsTrendsChart),
  { ssr: false, loading: () => <AnalyticsTrendsChartSkeleton /> }
)

export const LazyAnalyticsInterviewStats = dynamic(
  () => import('@/features/analytics/components/analytics-interview-stats').then((m) => m.AnalyticsInterviewStats),
  { ssr: false, loading: () => <AnalyticsInterviewStatsSkeleton /> }
)
