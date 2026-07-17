// ─── Generic API Response Types ──────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  success: false
  error: string
  code?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface CursorPaginatedResponse<T> {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
}

// ─── Query Params Types ───────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface CursorPaginationParams {
  cursor?: string
  limit?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchParams {
  query?: string
}

// ─── Action Result Types ──────────────────────────────────────────────────────

export type ActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
