import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { getAnalyticsExportDataAction } from '@/server/actions/analytics'
import { analyticsRangeSchema, type AnalyticsKPIs, type TopJobRow } from '@/types/analytics'
import type { HiringFunnelData, SourceData } from '@/types/database'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildCsv(rows: (string | number | null | undefined)[][]): string {
  return rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
}

function buildXmlExcel(data: {
  kpis?: AnalyticsKPIs
  funnel?: HiringFunnelData[]
  sources?: SourceData[]
  topJobs?: TopJobRow[]
}): string {
  let sheets = ''

  if (data.kpis) {
    sheets += `
  <Worksheet ss:Name="KPI Overview">
    <Table>
      <Row ss:Height="22">
        <Cell ss:StyleID="Header"><Data ss:Type="String">Metric</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Value</Data></Cell>
      </Row>
      <Row><Cell><Data ss:Type="String">Total Applications</Data></Cell><Cell><Data ss:Type="Number">${data.kpis.totalApplications}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Hires</Data></Cell><Cell><Data ss:Type="Number">${data.kpis.hires}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Offers</Data></Cell><Cell><Data ss:Type="Number">${data.kpis.offers}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Rejections</Data></Cell><Cell><Data ss:Type="Number">${data.kpis.rejections}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Conversion Rate (%)</Data></Cell><Cell><Data ss:Type="Number">${data.kpis.conversionRate}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Avg Time to Hire (days)</Data></Cell><Cell><Data ss:Type="Number">${data.kpis.avgTimeToHireDays}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Total Interviews</Data></Cell><Cell><Data ss:Type="Number">${data.kpis.totalInterviews}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Interview Completion Rate (%)</Data></Cell><Cell><Data ss:Type="Number">${data.kpis.interviewCompletionRate}</Data></Cell></Row>
      <Row><Cell><Data ss:Type="String">Offer Acceptance Rate (%)</Data></Cell><Cell><Data ss:Type="Number">${data.kpis.offerAcceptanceRate}</Data></Cell></Row>
    </Table>
  </Worksheet>`
  }

  if (data.funnel) {
    sheets += `
  <Worksheet ss:Name="Hiring Funnel">
    <Table>
      <Row ss:Height="22">
        <Cell ss:StyleID="Header"><Data ss:Type="String">Stage</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Count</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Percentage (%)</Data></Cell>
      </Row>
      ${data.funnel.map(f => `
      <Row>
        <Cell><Data ss:Type="String">${f.label}</Data></Cell>
        <Cell><Data ss:Type="Number">${f.count}</Data></Cell>
        <Cell><Data ss:Type="Number">${f.percentage}</Data></Cell>
      </Row>`).join('')}
    </Table>
  </Worksheet>`
  }

  if (data.sources) {
    sheets += `
  <Worksheet ss:Name="Candidate Sources">
    <Table>
      <Row ss:Height="22">
        <Cell ss:StyleID="Header"><Data ss:Type="String">Source</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Count</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Percentage (%)</Data></Cell>
      </Row>
      ${data.sources.map(s => `
      <Row>
        <Cell><Data ss:Type="String">${s.source}</Data></Cell>
        <Cell><Data ss:Type="Number">${s.count}</Data></Cell>
        <Cell><Data ss:Type="Number">${s.percentage}</Data></Cell>
      </Row>`).join('')}
    </Table>
  </Worksheet>`
  }

  if (data.topJobs) {
    sheets += `
  <Worksheet ss:Name="Top Performing Jobs">
    <Table>
      <Row ss:Height="22">
        <Cell ss:StyleID="Header"><Data ss:Type="String">Job Title</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Department</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Status</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Applications</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Hires</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Conversion Rate (%)</Data></Cell>
      </Row>
      ${data.topJobs.map(j => `
      <Row>
        <Cell><Data ss:Type="String">${j.title}</Data></Cell>
        <Cell><Data ss:Type="String">${j.department || '—'}</Data></Cell>
        <Cell><Data ss:Type="String">${j.status}</Data></Cell>
        <Cell><Data ss:Type="Number">${j.applicationCount}</Data></Cell>
        <Cell><Data ss:Type="Number">${j.hireCount}</Data></Cell>
        <Cell><Data ss:Type="Number">${j.conversionRate}</Data></Cell>
      </Row>`).join('')}
    </Table>
  </Worksheet>`
  }

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>HireTrack AI</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#111827" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Title">
      <Font ss:Bold="1" ss:Size="14"/>
    </Style>
  </Styles>
  ${sheets}
</Workbook>`
}

export async function GET(req: NextRequest) {
  // Auth check
  const session = await auth()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  if (!hasPermission(session.user.role, 'analytics:read')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Parse params
  const formatParam = req.nextUrl.searchParams.get('format') ?? 'csv'
  const rangeParam = req.nextUrl.searchParams.get('range') ?? '30d'
  const dateFromStr = req.nextUrl.searchParams.get('dateFrom') ?? undefined
  const dateToStr = req.nextUrl.searchParams.get('dateTo') ?? undefined
  const scopeParam = req.nextUrl.searchParams.get('scope') ?? 'all'
  const selectedRowsParam = req.nextUrl.searchParams.get('selectedRows') ?? undefined

  const rangeParsed = analyticsRangeSchema.safeParse(rangeParam)
  const range = rangeParsed.success ? rangeParsed.data : '30d'

  const result = await getAnalyticsExportDataAction(range, dateFromStr, dateToStr)
  if (!result.success) {
    return new NextResponse(result.error, { status: 500 })
  }

  let { kpis, funnel, sources, topJobs } = result.data

  // Apply row selection filter on Top Jobs if specified
  if (selectedRowsParam) {
    const selectedIds = selectedRowsParam.split(',')
    topJobs = topJobs.filter(j => selectedIds.includes(j.id))
  }

  // Determine what segment components to export
  const scopes = scopeParam.split(',')
  const exportAll = scopeParam === 'all'
  
  const showKpis = exportAll || scopes.includes('kpis')
  const showFunnel = exportAll || scopes.includes('funnel')
  const showSources = exportAll || scopes.includes('sources')
  const showJobs = exportAll || scopes.includes('topJobs')

  // EXCEL FORMAT EXPORT
  if (formatParam === 'excel') {
    const xmlContent = buildXmlExcel({
      kpis: showKpis ? kpis : undefined,
      funnel: showFunnel ? funnel : undefined,
      sources: showSources ? sources : undefined,
      topJobs: showJobs ? topJobs : undefined,
    })

    const filename = `hiretrack-analytics-${range}-${new Date().toISOString().slice(0, 10)}.xls`
    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  // CSV FORMAT EXPORT
  const sections: string[] = []

  if (showKpis) {
    sections.push('=== KPI OVERVIEW ===')
    sections.push(
      buildCsv([
        ['Metric', 'Value'],
        ['Total Applications', kpis.totalApplications],
        ['Hires', kpis.hires],
        ['Offers', kpis.offers],
        ['Rejections', kpis.rejections],
        ['Conversion Rate (%)', kpis.conversionRate],
        ['Avg Time to Hire (days)', kpis.avgTimeToHireDays],
        ['Total Interviews', kpis.totalInterviews],
        ['Interview Completion Rate (%)', kpis.interviewCompletionRate],
        ['Offer Acceptance Rate (%)', kpis.offerAcceptanceRate],
        ['Avg Interview Rating', kpis.avgInterviewRating ?? '—'],
      ])
    )
  }

  if (showFunnel) {
    sections.push('\n=== HIRING FUNNEL ===')
    sections.push(
      buildCsv([
        ['Stage', 'Count', 'Percentage (%)'],
        ...funnel.map((f) => [f.label, f.count, f.percentage]),
      ])
    )
  }

  if (showSources) {
    sections.push('\n=== CANDIDATE SOURCES ===')
    sections.push(
      buildCsv([
        ['Source', 'Count', 'Percentage (%)'],
        ...sources.map((s) => [s.source, s.count, s.percentage]),
      ])
    )
  }

  if (showJobs) {
    sections.push('\n=== TOP PERFORMING JOBS ===')
    sections.push(
      buildCsv([
        ['Job Title', 'Department', 'Status', 'Applications', 'Hires', 'Conversion Rate (%)'],
        ...topJobs.map((j) => [
          j.title,
          j.department,
          j.status,
          j.applicationCount,
          j.hireCount,
          j.conversionRate,
        ]),
      ])
    )
  }

  const csv = sections.join('\n')
  const filename = `hiretrack-analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
