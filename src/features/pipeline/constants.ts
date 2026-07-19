import { ApplicationStage } from '@/types/enums'

export const PIPELINE_STAGES: ApplicationStage[] = [
  ApplicationStage.APPLIED,
  ApplicationStage.SCREENING,
  ApplicationStage.INTERVIEW,
  ApplicationStage.TECHNICAL,
  ApplicationStage.HR_ROUND,
  ApplicationStage.OFFER,
  ApplicationStage.HIRED,
  ApplicationStage.REJECTED,
  ApplicationStage.WITHDRAWN,
]

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  TECHNICAL: 'Technical',
  HR_ROUND: 'HR Round',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}
