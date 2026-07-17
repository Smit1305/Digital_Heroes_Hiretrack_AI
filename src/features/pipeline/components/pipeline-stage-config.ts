import { ApplicationStage } from '@prisma/client'

export const STAGE_CONFIG: Record<
  ApplicationStage,
  {
    label: string
    colour: string        // Tailwind classes for column header dot
    cardAccent: string    // left border colour for cards
    bgClass: string       // column background
  }
> = {
  APPLIED: {
    label: 'Applied',
    colour: 'bg-slate-400',
    cardAccent: 'border-l-slate-400',
    bgClass: 'bg-slate-50 dark:bg-slate-900/20',
  },
  SCREENING: {
    label: 'Screening',
    colour: 'bg-blue-400',
    cardAccent: 'border-l-blue-400',
    bgClass: 'bg-blue-50/60 dark:bg-blue-900/10',
  },
  INTERVIEW: {
    label: 'Interview',
    colour: 'bg-violet-400',
    cardAccent: 'border-l-violet-400',
    bgClass: 'bg-violet-50/60 dark:bg-violet-900/10',
  },
  TECHNICAL: {
    label: 'Technical',
    colour: 'bg-amber-400',
    cardAccent: 'border-l-amber-400',
    bgClass: 'bg-amber-50/60 dark:bg-amber-900/10',
  },
  HR_ROUND: {
    label: 'HR Round',
    colour: 'bg-orange-400',
    cardAccent: 'border-l-orange-400',
    bgClass: 'bg-orange-50/60 dark:bg-orange-900/10',
  },
  OFFER: {
    label: 'Offer',
    colour: 'bg-emerald-400',
    cardAccent: 'border-l-emerald-400',
    bgClass: 'bg-emerald-50/60 dark:bg-emerald-900/10',
  },
  HIRED: {
    label: 'Hired',
    colour: 'bg-green-500',
    cardAccent: 'border-l-green-500',
    bgClass: 'bg-green-50/60 dark:bg-green-900/10',
  },
  REJECTED: {
    label: 'Rejected',
    colour: 'bg-red-400',
    cardAccent: 'border-l-red-400',
    bgClass: 'bg-red-50/40 dark:bg-red-900/10',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    colour: 'bg-zinc-400',
    cardAccent: 'border-l-zinc-400',
    bgClass: 'bg-zinc-50/40 dark:bg-zinc-900/10',
  },
}
