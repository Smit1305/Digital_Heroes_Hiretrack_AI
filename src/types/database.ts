import type {
    ActivityAction,
    ActivityLog,
    Application,
    ApplicationStage,
    Candidate,
    CandidateStatus,
    EmploymentType,
    EntityType,
    Interview,
    InterviewStatus,
    InterviewType,
    Job,
    JobStatus,
    Note,
    Notification,
    Organization,
    OrgPlan,
    User,
    UserRole,
    Offer,
    Scorecard,
} from '@prisma/client'

// Re-export Prisma types
export type {
    ActivityAction, ActivityLog, Application, ApplicationStage, Candidate, CandidateStatus, EmploymentType, EntityType, Interview, InterviewStatus, InterviewType, Job, JobStatus, Note, Notification, Organization, OrgPlan, User, UserRole, Offer, Scorecard
}

// ─── Extended / Computed Types ────────────────────────────────────────────────

export type UserSafe = Omit<User, 'passwordHash'>

export type JobWithRelations = Job & {
  hiringManager?: UserSafe | null
  _count?: {
    applications: number
  }
}

export type CandidateWithApplications = Candidate & {
  applications: Array<
    Application & {
      job: Pick<Job, 'id' | 'title' | 'department'>
      offer?: Offer | null
    }
  >
  interviews?: Array<
    Interview & {
      interviewer: Pick<User, 'id' | 'name' | 'email'>
      scorecard?: Scorecard | null
    }
  >
}

export type ApplicationWithDetails = Application & {
  candidate: Pick<Candidate, 'id' | 'firstName' | 'lastName' | 'email' | 'resumeUrl'>
  job: Pick<Job, 'id' | 'title' | 'department' | 'location'>
  interviews?: Interview[]
  notes?: Note[]
}

export type InterviewWithDetails = Interview & {
  candidate: Pick<Candidate, 'id' | 'firstName' | 'lastName' | 'email'>
  interviewer: UserSafe
  application: Pick<Application, 'id' | 'stage'> & {
    job: Pick<Job, 'id' | 'title'>
  }
  scorecard?: Scorecard | null
}

export type ActivityLogWithActor = ActivityLog & {
  actor?: UserSafe | null
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalJobs: number
  openPositions: number
  totalCandidates: number
  scheduledInterviews: number
  offers: number
  hires: number
  conversionRate: number
}

export interface HiringFunnelData {
  stage: ApplicationStage
  label: string
  count: number
  percentage: number
}

export interface MonthlyHiringData {
  month: string
  applications: number
  hires: number
}

export interface SourceData {
  source: string
  count: number
  percentage: number
}

// ─── Pipeline / Kanban Types ──────────────────────────────────────────────────

export interface KanbanColumn {
  id: ApplicationStage
  label: string
  applications: ApplicationWithDetails[]
}
