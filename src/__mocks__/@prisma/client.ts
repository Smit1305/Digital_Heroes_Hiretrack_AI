// Manual mock for @prisma/client used in unit tests.
// This prevents Prisma from trying to connect to a database.

export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  RECRUITER: 'RECRUITER',
  HIRING_MANAGER: 'HIRING_MANAGER',
  INTERVIEWER: 'INTERVIEWER',
  VIEWER: 'VIEWER',
} as const

export const CandidateStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLACKLISTED: 'BLACKLISTED',
} as const

export const ApplicationStage = {
  APPLIED: 'APPLIED',
  SCREENING: 'SCREENING',
  INTERVIEW: 'INTERVIEW',
  TECHNICAL: 'TECHNICAL',
  HR_ROUND: 'HR_ROUND',
  OFFER: 'OFFER',
  HIRED: 'HIRED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
} as const

export const JobStatus = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
} as const

export const EmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERNSHIP: 'INTERNSHIP',
  FREELANCE: 'FREELANCE',
} as const

export const InterviewType = {
  PHONE: 'PHONE',
  VIDEO: 'VIDEO',
  ONSITE: 'ONSITE',
  TECHNICAL: 'TECHNICAL',
  HR: 'HR',
  PANEL: 'PANEL',
  CODING: 'CODING',
  SYSTEM_DESIGN: 'SYSTEM_DESIGN',
  BEHAVIORAL: 'BEHAVIORAL',
  CULTURAL_FIT: 'CULTURAL_FIT',
  MANAGER_ROUND: 'MANAGER_ROUND',
} as const

export const InterviewStatus = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  RESCHEDULED: 'RESCHEDULED',
} as const

export const $Enums = {
  UserRole,
  CandidateStatus,
  ApplicationStage,
  JobStatus,
  EmploymentType,
  InterviewType,
  InterviewStatus,
}

export class PrismaClient {
  $connect = async () => {}
  $disconnect = async () => {}
  $transaction = async (ops: unknown[]) => ops
}
