'use client'

import { cn } from '@/lib/utils'
import type { KanbanColumn } from '@/types/database'
import { Droppable } from '@hello-pangea/dnd'
import { PipelineCard } from './pipeline-card'
import { STAGE_CONFIG } from './pipeline-stage-config'

interface PipelineColumnProps {
  column: KanbanColumn
  onStageChange: (applicationId: string, newStage: string) => void
}

export function PipelineColumn({ column, onStageChange }: PipelineColumnProps) {
  const config = STAGE_CONFIG[column.id]
  const count = column.applications.length

  return (
    <div className="flex h-full w-72 flex-shrink-0 flex-col rounded-xl border bg-card">
      {/* Column header */}
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <span
          className={cn('h-2.5 w-2.5 rounded-full flex-shrink-0', config.colour)}
          aria-hidden="true"
        />
        <h2 className="flex-1 text-sm font-semibold">{column.label}</h2>
        <span
          className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground"
          aria-label={`${count} application${count !== 1 ? 's' : ''}`}
        >
          {count}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px] transition-colors',
              snapshot.isDraggingOver
                ? `${config.bgClass} ring-2 ring-inset ring-ring/20`
                : 'bg-transparent'
            )}
            aria-label={`${column.label} column — drop area`}
          >
            {column.applications.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
                <p className="text-xs text-muted-foreground">No candidates</p>
              </div>
            )}

            {column.applications.map((app, index) => (
              <PipelineCard
                key={app.id}
                application={app}
                index={index}
                onStageChange={onStageChange}
              />
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
