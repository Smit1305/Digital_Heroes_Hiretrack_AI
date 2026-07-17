import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { NextRequest, NextResponse } from 'next/server'
import { format } from 'date-fns'

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  if (!hasPermission(session.user.role, 'interviews:read')) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const orgId = session.user.organizationId
  if (!orgId) {
    return new NextResponse('Organization not found', { status: 400 })
  }

  const interviewId = params.id
  const interview = await db.interview.findFirst({
    where: {
      id: interviewId,
      application: {
        job: {
          organizationId: orgId,
        },
      },
    },
    include: {
      candidate: { select: { firstName: true, lastName: true } },
      interviewer: { select: { name: true, email: true } },
      application: {
        select: {
          job: { select: { title: true } },
        },
      },
    },
  })

  if (!interview) {
    return new NextResponse('Interview not found', { status: 404 })
  }

  const candidateName = `${interview.candidate.firstName} ${interview.candidate.lastName}`
  const jobTitle = interview.application.job.title
  const interviewerName = interview.interviewer.name || interview.interviewer.email || 'Interviewer'
  
  const start = new Date(interview.scheduledAt)
  const durationMinutes = interview.duration || 60
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000)

  // Helper to format date into ICS-compliant UTC string (YYYYMMDDTHHMMSSZ)
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const now = new Date()

  // Build the iCalendar string
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HireTrack AI//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${interview.id}@hiretrack-ai.com`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:Interview with ${candidateName} - ${interview.type} Round`,
    `DESCRIPTION:Job: ${jobTitle}\\nInterviewer: ${interviewerName}\\nType: ${interview.type}\\nDuration: ${durationMinutes} mins\\nNotes: ${interview.notes || 'None'}`,
    `LOCATION:${interview.location || 'Video Call Link / Room'}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  const icsContent = icsLines.join('\r\n')

  return new NextResponse(icsContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="interview-${interviewId}.ics"`,
    },
  })
}
