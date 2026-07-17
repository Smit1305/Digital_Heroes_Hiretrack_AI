import { PIPELINE_STAGES } from '@/features/pipeline/constants'
import { STAGE_CONFIG } from './pipeline-stage-config'

function ColumnSkeleton({ stageKey }: { stageKey: string }) {
  const stage = stageKey as keyof typeof STAGE_CONFIG
  const config = STAGE_CONFIG[stage]
  return (
    <div className="flex h-full w-72 flex-shrink-0 flex-col rounded-xl border bg-card">
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${config.colour}`} />
        <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
        <div className="h-5 w-6 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="flex-1 p-2 space-y-2">
        {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-l-4 bg-card p-3 space-y-2" style={{ borderLeftColor: 'hsl(var(--border))' }}>
            <div className="flex items-start gap-2">
              <div className="h-7 w-7 animate-pulse rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="flex justify-between">
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PipelineSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="ml-auto h-8 w-20 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex h-full gap-3 px-1 min-w-max">
          {PIPELINE_STAGES.map((stage) => (
            <ColumnSkeleton key={stage} stageKey={stage} />
          ))}
        </div>
      </div>
    </div>
  )
}
