'use server'

import { requirePermission } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import type { ActionResult } from '@/types/api'
import {
  createOfferSchema,
  publicApplySchema,
  type CreateOfferInput,
  type PublicApplyInput,
} from '@/validators/application'
import { ApplicationStage, OfferStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// ─── Candidate Online Application ─────────────────────────────────────────────

export async function publicApplyAction(
  jobId: string,
  input: PublicApplyInput
): Promise<ActionResult<{ applicationId: string }>> {
  const parsed = publicApplySchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid input fields.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { firstName, lastName, email, phone, linkedin, portfolio, coverLetter, resumeUrl, resumeFileName } = parsed.data

  // Fetch job to determine organization
  const job = await db.job.findFirst({
    where: { id: jobId, deletedAt: null, status: 'OPEN' },
    select: { id: true, title: true, organizationId: true, organization: { select: { name: true } } },
  })

  if (!job) {
    return { success: false, error: 'Job listing is no longer active.' }
  }

  const orgId = job.organizationId
  const normalizedEmail = email.toLowerCase()

  // Start database transaction
  const result = await db.$transaction(async (tx) => {
    // 1. Get or create candidate profile
    let candidate = await tx.candidate.findFirst({
      where: { email: normalizedEmail, organizationId: orgId, deletedAt: null },
      select: { id: true },
    })

    if (!candidate) {
      candidate = await tx.candidate.create({
        data: {
          firstName,
          lastName,
          email: normalizedEmail,
          phone: phone || null,
          linkedin: linkedin || null,
          portfolio: portfolio || null,
          resumeUrl,
          resumeFileName,
          organizationId: orgId,
          status: 'ACTIVE',
        },
        select: { id: true },
      })

      // Log Candidate Created Activity
      await tx.activityLog.create({
        data: {
          entityType: 'CANDIDATE',
          entityId: candidate.id,
          action: 'CREATED',
          candidateId: candidate.id,
          organizationId: orgId,
          metadata: { name: `${firstName} ${lastName}`, source: 'Online Careers Board' },
        },
      })
    }

    // 2. Check for duplicate application
    const existingApp = await tx.application.findFirst({
      where: { candidateId: candidate.id, jobId, deletedAt: null },
      select: { id: true },
    })

    if (existingApp) {
      throw new Error('DUPLICATE_APPLICATION')
    }

    // 3. Create Application
    const application = await tx.application.create({
      data: {
        candidateId: candidate.id,
        jobId,
        stage: 'APPLIED',
        stageOrder: 0,
      },
      select: { id: true },
    })

    // Log Application Created Activity
    await tx.activityLog.create({
      data: {
        entityType: 'APPLICATION',
        entityId: application.id,
        action: 'CREATED',
        candidateId: candidate.id,
        applicationId: application.id,
        jobId,
        organizationId: orgId,
        metadata: {
          candidateName: `${firstName} ${lastName}`,
          jobTitle: job.title,
        },
      },
    })

    // Add Cover Letter Note if provided
    if (coverLetter?.trim()) {
      await tx.note.create({
        data: {
          content: `Cover Letter:\n${coverLetter.trim()}`,
          authorId: '', // System note
          candidateId: candidate.id,
          applicationId: application.id,
        },
      })
    }

    return { applicationId: application.id }
  }).catch((err) => {
    if (err.message === 'DUPLICATE_APPLICATION') {
      return { duplicate: true }
    }
    throw err
  })

  if ('duplicate' in result) {
    return { success: false, error: 'You have already applied for this job listing.' }
  }

  // Send mock confirmation email (async)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const trackingUrl = `${appUrl}/careers/applications/${result.applicationId}`

  await sendEmail({
    to: email,
    subject: `Application Received — ${job.title} at ${job.organization.name}`,
    text: `Hi ${firstName},\n\nWe have received your application for the ${job.title} position. You can track your application status here: ${trackingUrl}\n\nBest regards,\n${job.organization.name} Hiring Team`,
    html: `
      <p>Hi ${firstName},</p>
      <p>Thank you for applying to the <strong>${job.title}</strong> position at <strong>${job.organization.name}</strong>.</p>
      <p>We have successfully received your resume and details. You can track your application's current stage and scheduled interviews online via our portal:</p>
      <p><a href="${trackingUrl}">Track Application Status</a></p>
      <br/>
      <p>Best regards,</p>
      <p>${job.organization.name} Hiring Team</p>
    `,
  }).catch((err) => console.error('Failed to send apply confirmation email:', err))

  revalidatePath('/dashboard')
  revalidatePath('/pipeline')
  revalidatePath('/candidates')

  return { success: true, data: result }
}

// ─── Recruiter Offer Management ───────────────────────────────────────────────

export async function createOfferAction(
  applicationId: string,
  input: CreateOfferInput
): Promise<ActionResult<void>> {
  const user = await requirePermission('applications:update')
  const orgId = user.organizationId
  if (!orgId) return { success: false, error: 'No organization found.' }

  const parsed = createOfferSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Invalid offer input.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { salary, currency, startDate, notes } = parsed.data

  const application = await db.application.findFirst({
    where: { id: applicationId, deletedAt: null, job: { organizationId: orgId } },
    select: { id: true, candidateId: true, jobId: true, job: { select: { title: true } }, candidate: { select: { firstName: true, lastName: true } } },
  })

  if (!application) {
    return { success: false, error: 'Application not found.' }
  }

  // Create or update offer details
  await db.offer.upsert({
    where: { applicationId },
    create: {
      applicationId,
      salary,
      currency,
      startDate,
      notes: notes || null,
      status: 'PENDING',
      approvedBy: user.id,
    },
    update: {
      salary,
      currency,
      startDate,
      notes: notes || null,
      status: 'PENDING',
      approvedBy: user.id,
    },
  })

  // Automatically move application stage to OFFER
  await db.application.update({
    where: { id: applicationId },
    data: { stage: 'OFFER' },
  })

  // Log activity
  await db.activityLog.create({
    data: {
      actorId: user.id,
      entityType: 'APPLICATION',
      entityId: applicationId,
      action: 'OFFER_SENT',
      candidateId: application.candidateId,
      applicationId,
      jobId: application.jobId,
      organizationId: orgId,
      metadata: {
        salary,
        currency,
        startDate,
        candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
        jobTitle: application.job.title,
      },
    },
  })

  revalidatePath('/pipeline')
  revalidatePath(`/candidates/${application.candidateId}`)

  return { success: true, data: undefined, message: 'Offer created and sent to candidate.' }
}

export async function getOfferAction(applicationId: string): Promise<ActionResult<any>> {
  // Candidate tracking uses this publicly or recruiters privately
  const offer = await db.offer.findUnique({
    where: { applicationId },
    include: {
      application: {
        select: {
          id: true,
          stage: true,
          job: { select: { title: true, organization: { select: { name: true } } } },
        },
      },
    },
  })

  if (!offer) {
    return { success: false, error: 'No offer exists for this application.' }
  }

  return { success: true, data: offer }
}

// ─── Candidate Offer Accept/Reject Action ─────────────────────────────────────

export async function updateOfferStatusAction(
  applicationId: string,
  status: 'ACCEPTED' | 'REJECTED_BY_CANDIDATE'
): Promise<ActionResult<void>> {
  const offer = await db.offer.findUnique({
    where: { applicationId },
    include: {
      application: {
        select: {
          id: true,
          candidateId: true,
          jobId: true,
          job: { select: { title: true, organizationId: true, organization: { select: { name: true } } } },
          candidate: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
  })

  if (!offer) {
    return { success: false, error: 'Offer not found.' }
  }

  if (offer.status !== 'PENDING') {
    return { success: false, error: 'Offer has already been processed.' }
  }

  const app = offer.application
  const orgId = app.job.organizationId

  const targetStage = status === 'ACCEPTED' ? ApplicationStage.HIRED : ApplicationStage.REJECTED
  const activityAction = status === 'ACCEPTED' ? 'OFFER_ACCEPTED' : 'OFFER_REJECTED'

  await db.$transaction([
    db.offer.update({
      where: { applicationId },
      data: { status },
    }),
    db.application.update({
      where: { id: applicationId },
      data: {
        stage: targetStage,
        ...(status === 'ACCEPTED' && { hiredAt: new Date() }),
        ...(status === 'REJECTED_BY_CANDIDATE' && { rejectedAt: new Date() }),
      },
    }),
    db.activityLog.create({
      data: {
        entityType: 'APPLICATION',
        entityId: applicationId,
        action: activityAction as 'OFFER_ACCEPTED' | 'OFFER_REJECTED',
        candidateId: app.candidateId,
        applicationId,
        jobId: app.jobId,
        organizationId: orgId,
        metadata: {
          candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
          jobTitle: app.job.title,
        },
      },
    }),
  ])

  // Email notifications to recruiter/hiring manager
  // Let's log in console for development
  console.log(`[ALERT] Candidate ${app.candidate.firstName} has ${status.toLowerCase()} the offer for ${app.job.title}!`)

  revalidatePath('/pipeline')
  revalidatePath(`/candidates/${app.candidateId}`)
  revalidatePath('/dashboard')

  return { success: true, data: undefined, message: `Offer successfully ${status.toLowerCase() === 'accepted' ? 'accepted' : 'declined'}.` }
}
