'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Star, ThumbsUp, ThumbsDown, Slash, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { submitScorecardAction } from '@/server/actions/interviews'
import type { Interview, Scorecard } from '@prisma/client'
import { cn } from '@/lib/utils'

const CRITERIA_TEMPLATES: Record<string, string[]> = {
  CODING: ['Problem Solving', 'Algorithms & Data Structures', 'Code Quality & Patterns', 'Communication'],
  SYSTEM_DESIGN: ['Scalability & Performance', 'Tradeoffs Analysis', 'Architecture & Components', 'Communication'],
  HR: ['Cultural Fit', 'Communication & Clarity', 'Career Goals & Motivation', 'Salary Alignment'],
  TECHNICAL: ['Domain Knowledge', 'Problem Solving', 'Technical Communication', 'Hands-on Proficiency'],
  BEHAVIORAL: ['Leadership & Ownership', 'Collaboration & Empathy', 'Conflict Resolution', 'Adaptability & Growth'],
  CULTURAL_FIT: ['Values Alignment', 'Team Synergy', 'Communication', 'Interpersonal Empathy'],
  MANAGER_ROUND: ['Role Expectations', 'Experience & Track Record', 'Leadership Capabilities', 'Strategic Thinking'],
  PHONE: ['Initial Screen', 'Communication', 'Interest Level', 'Basic Experience'],
  VIDEO: ['Core Competencies', 'Communication', 'Technical Fit', 'Behavioral Fit'],
  ONSITE: ['Overall Presentation', 'Collaboration', 'Problem Solving', 'Cultural Fit'],
  PANEL: ['Consensus Rating', 'Q&A Responsiveness', 'Technical depth', 'Communication'],
}

const RECOMMENDATIONS = [
  { value: 'STRONG_HIRE', label: 'Strong Hire', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20', activeColor: 'bg-emerald-600 text-white border-emerald-600', icon: ThumbsUp },
  { value: 'HIRE', label: 'Hire', color: 'bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20', activeColor: 'bg-green-600 text-white border-green-600', icon: ThumbsUp },
  { value: 'NEUTRAL', label: 'Neutral', color: 'bg-slate-500/10 text-slate-500 border-slate-500/30 hover:bg-slate-500/20', activeColor: 'bg-slate-600 text-white border-slate-600', icon: Slash },
  { value: 'NO_HIRE', label: 'No Hire', color: 'bg-orange-500/10 text-orange-500 border-orange-500/30 hover:bg-orange-500/20', activeColor: 'bg-orange-600 text-white border-orange-600', icon: ThumbsDown },
  { value: 'STRONG_NO_HIRE', label: 'Strong No Hire', color: 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20', activeColor: 'bg-red-600 text-white border-red-600', icon: ThumbsDown },
] as const

interface ScorecardFormProps {
  interview: Interview & {
    candidate: { firstName: string; lastName: string }
  }
  initialScorecard?: Scorecard | null
}

export function ScorecardForm({ interview, initialScorecard }: ScorecardFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const criteria = CRITERIA_TEMPLATES[interview.type] || ['Overall Competency', 'Communication', 'Culture Alignment']

  const [recommendation, setRecommendation] = useState<string>(
    initialScorecard?.recommendation || ''
  )
  const [summary, setSummary] = useState(initialScorecard?.summary || '')
  const [strengths, setStrengths] = useState(initialScorecard?.strengths || '')
  const [weaknesses, setWeaknesses] = useState(initialScorecard?.weaknesses || '')

  // Initialize ratings state
  const [ratings, setRatings] = useState<Record<string, number>>({})

  useEffect(() => {
    if (initialScorecard?.ratings && typeof initialScorecard.ratings === 'object') {
      setRatings(initialScorecard.ratings as Record<string, number>)
    } else {
      const initialRatings: Record<string, number> = {}
      criteria.forEach((c) => {
        initialRatings[c] = 3 // default neutral rating
      })
      setRatings(initialRatings)
    }
  }, [initialScorecard, interview.type])

  const handleRatingChange = (criterion: string, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [criterion]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!recommendation) {
      toast.error('Please select a recommendation.')
      return
    }

    if (summary.trim().length < 5) {
      toast.error('Summary must be at least 5 characters.')
      return
    }

    if (strengths.trim().length < 3) {
      toast.error('Strengths must be at least 3 characters.')
      return
    }

    if (weaknesses.trim().length < 3) {
      toast.error('Weaknesses must be at least 3 characters.')
      return
    }

    startTransition(async () => {
      const result = await submitScorecardAction(interview.id, {
        recommendation: recommendation as any,
        summary: summary.trim(),
        strengths: strengths.trim(),
        weaknesses: weaknesses.trim(),
        ratings,
      })

      if (!result.success) {
        toast.error(result.error || 'Failed to submit scorecard.')
        return
      }

      toast.success(result.message || 'Scorecard submitted successfully!')
      router.push(`/candidates/${interview.candidateId}`)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Overall Recommendation */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Overall Recommendation</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {RECOMMENDATIONS.map((rec) => {
            const Icon = rec.icon
            const isSelected = recommendation === rec.value
            return (
              <button
                key={rec.value}
                type="button"
                onClick={() => setRecommendation(rec.value)}
                className={cn(
                  'flex flex-col items-center justify-center p-3 border rounded-xl transition-all gap-1.5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  isSelected ? rec.activeColor : rec.color
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="text-xs font-semibold">{rec.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Criteria Ratings */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Criteria Ratings</Label>
        <Card className="border shadow-sm">
          <CardContent className="divide-y divide-border p-0">
            {criteria.map((criterion) => {
              const currentRating = ratings[criterion] || 3
              return (
                <div key={criterion} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                  <div>
                    <span className="text-sm font-medium text-foreground">{criterion}</span>
                    <span className="block text-xs text-muted-foreground">Rate proficiency on a 1-5 scale</span>
                  </div>
                  <div className="flex items-center gap-1.5" role="group" aria-label={`Rating for ${criterion}`}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = star <= currentRating
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(criterion, star)}
                          className="p-1 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star
                            className={cn(
                              'h-5 w-5',
                              isActive ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
                            )}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Feedback details */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="strengths" className="text-sm font-semibold">
            Strengths <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="strengths"
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder="Describe candidate's core strengths, technical highlights, positive traits..."
            className="h-28 bg-background"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weaknesses" className="text-sm font-semibold">
            Weaknesses / Areas of Improvement <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="weaknesses"
            value={weaknesses}
            onChange={(e) => setWeaknesses(e.target.value)}
            placeholder="Describe candidate's gaps, growth areas, concerns, missing competencies..."
            className="h-28 bg-background"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary" className="text-sm font-semibold">
            Overall Summary & Explanation <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Provide a final summary statement explaining your recommendation..."
            className="h-32 bg-background"
            required
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            router.push(`/candidates/${interview.candidateId}`)
          }}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="min-w-[140px]">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Scorecard'
          )}
        </Button>
      </div>
    </form>
  )
}
