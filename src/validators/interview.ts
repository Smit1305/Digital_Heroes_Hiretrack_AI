import { InterviewStatus, InterviewType } from '@prisma/client'
import { z } from 'zod'

export const createInterviewSchema = z.object({
  candidateId: z.string().cuid('Invalid candidate ID'),
  applicationId: z.string().cuid('Invalid application ID'),
  interviewerId: z.string().cuid('Invalid interviewer ID'),
  scheduledAt: z.coerce.date().refine((d) => d > new Date(), {
    message: 'Interview must be scheduled in the future',
  }),
  duration: z.number().int().min(15).max(480).optional().default(60),
  type: z.nativeEnum(InterviewType).default(InterviewType.VIDEO),
  location: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),
})

export const updateInterviewSchema = z.object({
  scheduledAt: z.coerce.date().optional(),
  duration: z.number().int().min(15).max(480).optional(),
  type: z.nativeEnum(InterviewType).optional(),
  status: z.nativeEnum(InterviewStatus).optional(),
  location: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),
  feedback: z.string().max(5000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
})

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>

export const submitScorecardSchema = z.object({
  recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'NEUTRAL', 'NO_HIRE', 'STRONG_NO_HIRE']),
  summary: z.string().min(5, 'Summary must be at least 5 characters').max(10000),
  strengths: z.string().min(3, 'Strengths must be at least 3 characters').max(5000),
  weaknesses: z.string().min(3, 'Weaknesses must be at least 3 characters').max(5000),
  ratings: z.record(z.string(), z.coerce.number().int().min(1).max(5)),
})

export type SubmitScorecardInput = z.infer<typeof submitScorecardSchema>
