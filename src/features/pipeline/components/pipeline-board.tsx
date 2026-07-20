'use client'

import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { RefreshCw, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { getPipelineAction, moveApplicationAction } from '@/server/actions/pipeline'
import { PIPELINE_STAGES } from '@/features/pipeline/constants'
import type { KanbanColumn } from '@/types/database'
import { ApplicationStage } from '@/types/enums'
import { PipelineColumn } from './pipeline-column'

interface PipelineBoardProps {
  initialColumns: KanbanColumn[]
  jobId?: string
}

type HistoryEntry = {
  applicationId: string
  fromStage: ApplicationStage
  toStage: ApplicationStage
  columnsBefore: KanbanColumn[]
}

export function PipelineBoard({ initialColumns, jobId }: PipelineBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isRefreshing, startRefresh] = useTransition()

  useEffect(() => {
    setColumns(initialColumns)
  }, [initialColumns])

  // Move application between columns (optimistic)
  const applyMove = useCallback(
    (
      cols: KanbanColumn[],
      applicationId: string,
      fromStageId: ApplicationStage,
      toStageId: ApplicationStage,
      fromIndex: number,
      toIndex: number
    ): KanbanColumn[] => {
      return cols.map((col) => {
        if (col.id === fromStageId) {
          const apps = [...col.applications]
          const [removed] = apps.splice(fromIndex, 1)
          if (!removed) return col
          // If same column, re-insert
          if (fromStageId === toStageId) {
            apps.splice(toIndex, 0, removed)
            return { ...col, applications: apps }
          }
          return { ...col, applications: apps }
        }
        if (col.id === toStageId && fromStageId !== toStageId) {
          const apps = [...col.applications]
          const source = cols
            .find((c) => c.id === fromStageId)
            ?.applications[fromIndex]
          if (!source) return col
          const updated = { ...source, stage: toStageId }
          apps.splice(toIndex, 0, updated)
          return { ...col, applications: apps }
        }
        return col
      })
    },
    []
  )

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result
      if (!destination) return
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return
      }

      const fromStage = source.droppableId as ApplicationStage
      const toStage = destination.droppableId as ApplicationStage

      // Validate stage values
      if (
        !PIPELINE_STAGES.includes(fromStage) ||
        !PIPELINE_STAGES.includes(toStage)
      ) {
        return
      }

      const columnsBefore = columns
      const optimisticCols = applyMove(
        columns,
        draggableId,
        fromStage,
        toStage,
        source.index,
        destination.index
      )

      // Push to history for undo (keep last 10)
      setHistory((prev) => [
        { applicationId: draggableId, fromStage, toStage, columnsBefore },
        ...prev.slice(0, 9),
      ])

      // Apply optimistic update immediately
      setColumns(optimisticCols)

      // Commit to server
      const newOrder = destination.index
      moveApplicationAction(draggableId, toStage, newOrder).then((result) => {
        if (!result.success) {
          // Rollback on failure
          setColumns(columnsBefore)
          setHistory((prev) => prev.slice(1))
          toast.error(result.error ?? 'Failed to move candidate.')
        }
      })
    },
    [columns, applyMove]
  )

  // Optimistic stage change from card action menu (e.g. reject button)
  const handleStageChange = useCallback(
    (applicationId: string, newStage: string) => {
      const toStage = newStage as ApplicationStage
      if (!PIPELINE_STAGES.includes(toStage)) return

      // Find current column
      let fromStage: ApplicationStage | undefined
      let fromIndex = -1
      for (const col of columns) {
        const idx = col.applications.findIndex((a) => a.id === applicationId)
        if (idx !== -1) {
          fromStage = col.id
          fromIndex = idx
          break
        }
      }
      if (!fromStage || fromIndex === -1) return

      const toCol = columns.find((c) => c.id === toStage)
      const toIndex = toCol?.applications.length ?? 0

      const columnsBefore = columns
      const optimistic = applyMove(columns, applicationId, fromStage, toStage, fromIndex, toIndex)
      setHistory((prev) => [
        { applicationId, fromStage: fromStage!, toStage, columnsBefore },
        ...prev.slice(0, 9),
      ])
      setColumns(optimistic)
    },
    [columns, applyMove]
  )

  // Undo last move
  const handleUndo = useCallback(() => {
    const [last, ...rest] = history
    if (!last) return

    setColumns(last.columnsBefore)
    setHistory(rest)

    // Reverse on server
    moveApplicationAction(last.applicationId, last.fromStage).then((result) => {
      if (!result.success) {
        toast.error('Failed to undo move.')
      } else {
        toast.success('Move undone.')
      }
    })
  }, [history])

  // Refresh from server
  const handleRefresh = useCallback(() => {
    startRefresh(async () => {
      const result = await getPipelineAction(jobId)
      if (result.success) {
        setColumns(result.data)
        setHistory([])
      } else {
        toast.error('Failed to refresh pipeline.')
      }
    })
  }, [jobId])

  const totalApplications = columns.reduce((n, c) => n + c.applications.length, 0)

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-sm text-muted-foreground">
          {totalApplications} candidate{totalApplications !== 1 ? 's' : ''} in pipeline
        </p>
        <div className="ml-auto flex items-center gap-2">
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              aria-label="Undo last move"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Undo
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh pipeline"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Board */}
      <div
        className="flex-1 overflow-x-auto overflow-y-hidden pb-4"
        aria-label="Hiring pipeline kanban board"
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full gap-3 px-1 min-w-max">
            {columns.map((column) => (
              <PipelineColumn
                key={column.id}
                column={column}
                onStageChange={handleStageChange}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}
