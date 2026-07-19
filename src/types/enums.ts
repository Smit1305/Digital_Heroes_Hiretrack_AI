export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  RECRUITER: 'RECRUITER',
  HIRING_MANAGER: 'HIRING_MANAGER',
  INTERVIEWER: 'INTERVIEWER',
  VIEWER: 'VIEWER',
  CANDIDATE: 'CANDIDATE',
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const OrgPlan = {
  FREE: 'FREE',
  STARTER: 'STARTER',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE',
} as const
export type OrgPlan = (typeof OrgPlan)[keyof typeof OrgPlan]

export const JobStatus = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
} as const
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus]

export const EmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERNSHIP: 'INTERNSHIP',
  FREELANCE: 'FREELANCE',
} as const
export type EmploymentType = (typeof EmploymentType)[keyof typeof EmploymentType]

export const CandidateStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLACKLISTED: 'BLACKLISTED',
} as const
export type CandidateStatus = (typeof CandidateStatus)[keyof typeof CandidateStatus]

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
export type ApplicationStage = (typeof ApplicationStage)[keyof typeof ApplicationStage]

export const InterviewType = {
  PHONE: 'PHONE',
  VIDEO: 'VIDEO',
  ONSITE: 'ONSITE',
  HR: 'HR',
  TECHNICAL: 'TECHNICAL',
  CODING: 'CODING',
  SYSTEM_DESIGN: 'SYSTEM_DESIGN',
  BEHAVIORAL: 'BEHAVIORAL',
  CULTURAL_FIT: 'CULTURAL_FIT',
  MANAGER_ROUND: 'MANAGER_ROUND',
  PANEL: 'PANEL',
} as const
export type InterviewType = (typeof InterviewType)[keyof typeof InterviewType]

export const InterviewStatus = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  RESCHEDULED: 'RESCHEDULED',
} as const
export type InterviewStatus = (typeof InterviewStatus)[keyof typeof InterviewStatus]

export const ActivityAction = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED',
  STAGE_CHANGED: 'STAGE_CHANGED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  NOTE_ADDED: 'NOTE_ADDED',
  FILE_UPLOADED: 'FILE_UPLOADED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED: 'INTERVIEW_COMPLETED',
  OFFER_SENT: 'OFFER_SENT',
  OFFER_ACCEPTED: 'OFFER_ACCEPTED',
  OFFER_REJECTED: 'OFFER_REJECTED',
} as const
export type ActivityAction = (typeof ActivityAction)[keyof typeof ActivityAction]

export const EntityType = {
  JOB: 'JOB',
  CANDIDATE: 'CANDIDATE',
  APPLICATION: 'APPLICATION',
  INTERVIEW: 'INTERVIEW',
  NOTE: 'NOTE',
  USER: 'USER',
  ORGANIZATION: 'ORGANIZATION',
} as const
export type EntityType = (typeof EntityType)[keyof typeof EntityType]

export const OfferStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED_BY_CANDIDATE: 'REJECTED_BY_CANDIDATE',
  ACCEPTED: 'ACCEPTED',
} as const
export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus]
