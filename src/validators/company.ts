import { z } from 'zod'
import { OrgPlan } from '@/types/enums'

export const companyRegisterSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  companySize: z.string().min(1, 'Company size is required'),
  industry: z.string().min(2, 'Industry must be at least 2 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  plan: z.nativeEnum(OrgPlan),
  billingPeriod: z.enum(['MONTHLY', 'YEARLY']),
})

export type CompanyRegisterInput = z.infer<typeof companyRegisterSchema>
