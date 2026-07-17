import { z } from 'zod'

export const signUpSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    organizationName: z
      .string()
      .min(2, 'Organization name must be at least 2 characters')
      .max(100)
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>

export const candidateSignUpSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional().or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    linkedinUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    portfolioUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    githubUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    resumeUrl: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type CandidateSignUpInput = z.infer<typeof candidateSignUpSchema>

export const candidateProfileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional().or(z.literal('')),
  linkedinUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  resumeUrl: z.string().optional().or(z.literal('')),
})

export type CandidateProfileUpdateInput = z.infer<typeof candidateProfileUpdateSchema>
