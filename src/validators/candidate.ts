import { ApplicationStage, CandidateStatus } from '@/types/enums'
import { z } from 'zod'

export const createCandidateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().max(50).optional(),
  linkedin: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  portfolio: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  location: z.string().max(200).optional(),
  experience: z.number().int().min(0).max(50).optional(),
  education: z.string().max(500).optional(),
  skills: z.array(z.string().max(50)).max(50).default([]),
  notes: z.string().max(5000).optional(),
  source: z.string().max(100).optional(),
  status: z.nativeEnum(CandidateStatus).default(CandidateStatus.ACTIVE),
})

export const updateCandidateSchema = createCandidateSchema.partial()

export const candidateFiltersSchema = z.object({
  query: z.string().optional(),
  status: z.nativeEnum(CandidateStatus).optional(),
  stage: z.nativeEnum(ApplicationStage).optional(),
  jobId: z.string().cuid().optional(),
  source: z.string().optional(),
  experience: z.coerce.number().int().min(0).max(50).optional(),
  skills: z.array(z.string()).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['firstName', 'lastName', 'createdAt', 'updatedAt', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>
export type CandidateFiltersInput = z.infer<typeof candidateFiltersSchema>
