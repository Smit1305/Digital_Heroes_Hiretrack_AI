import { EmploymentType, JobStatus } from '@/types/enums'
import { z } from 'zod'

export const createJobSchema = z.object({
  title: z.string().min(2, 'Job title must be at least 2 characters').max(200),
  department: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  employmentType: z.nativeEnum(EmploymentType).default(EmploymentType.FULL_TIME),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  salaryCurrency: z.string().length(3).default('USD'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  status: z.nativeEnum(JobStatus).default(JobStatus.DRAFT),
  isRemote: z.boolean().default(false),
  experienceLevel: z.string().optional(),
  hiringManagerId: z.string().cuid().optional(),
})

export const updateJobSchema = createJobSchema.partial()

export const jobFiltersSchema = z.object({
  query: z.string().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  department: z.string().optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  isRemote: z.boolean().optional(),
  hiringManagerId: z.string().cuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
export type JobFiltersInput = z.infer<typeof jobFiltersSchema>
