import { z } from 'zod'

export const publicApplySchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().max(50).optional().or(z.literal('')),
  linkedin: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  portfolio: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  coverLetter: z.string().max(10000).optional().or(z.literal('')),
  resumeUrl: z.string().min(1, 'Resume upload is required'),
  resumeFileName: z.string().min(1, 'Resume file name is required'),
})

export type PublicApplyInput = z.infer<typeof publicApplySchema>

export const createOfferSchema = z.object({
  salary: z.coerce.number().int().min(0, 'Salary must be at least 0'),
  currency: z.string().min(1, 'Currency is required').default('USD'),
  startDate: z.coerce.date({ message: 'Invalid start date format' }),
  notes: z.string().max(5000).optional().or(z.literal('')),
})

export type CreateOfferInput = z.infer<typeof createOfferSchema>
