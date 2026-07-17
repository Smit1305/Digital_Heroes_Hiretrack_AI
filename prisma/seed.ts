/**
 * HireTrack AI — Database Seed Script
 *
 * Demo account: demo@hiretrack.ai / demo1234
 *
 * Run: npm run db:seed
 */

import { $Enums } from '@prisma/client'
import 'dotenv/config'
import bcrypt from 'bcryptjs'

import { createPrismaClient } from '../src/lib/prisma-client'

// Pull enum types from generated client
type UserRole = $Enums.UserRole
type JobStatus = $Enums.JobStatus
type EmploymentType = $Enums.EmploymentType
type ApplicationStage = $Enums.ApplicationStage
type InterviewType = $Enums.InterviewType
type InterviewStatus = $Enums.InterviewStatus
type ActivityAction = $Enums.ActivityAction
type EntityType = $Enums.EntityType
type CandidateStatus = $Enums.CandidateStatus

const db = createPrismaClient()

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function daysFromNow(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

// ─── Seed Data Definitions ────────────────────────────────────────────────────

const ORG = {
  name: 'Acme Inc.',
  slug: 'acme-inc',
  logo: 'https://api.dicebear.com/7.x/initials/svg?seed=Acme',
  plan: 'PRO' as const,
  website: 'https://acmeinc.example.com',
  industry: 'Technology',
  size: '201-500',
}

const USERS: Array<{
  name: string
  email: string
  password: string
  role: UserRole
  avatar: string
}> = [
  {
    name: 'Demo Recruiter',
    email: 'recruiter@hiretrack.ai',
    password: 'recruiterpassword123',
    role: 'RECRUITER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=recruiter',
  },
  {
    name: 'Super Admin',
    email: 'admin@hiretrack.ai',
    password: 'adminpassword123',
    role: 'SUPER_ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  },
  {
    name: 'Demo Candidate',
    email: 'candidate@hiretrack.ai',
    password: 'candidatepassword123',
    role: 'CANDIDATE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=candidate',
  },
  {
    name: 'Bob Martinez',
    email: 'bob@acmecorp.example.com',
    password: 'Password1',
    role: 'HIRING_MANAGER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
  },
  {
    name: 'Carol Singh',
    email: 'carol@acmecorp.example.com',
    password: 'Password1',
    role: 'INTERVIEWER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
  },
  {
    name: 'David Kim',
    email: 'david@acmecorp.example.com',
    password: 'Password1',
    role: 'VIEWER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
  },
]

async function resetSeedData() {
  const existingOrg = await db.organization.findUnique({
    where: { slug: ORG.slug },
    select: { id: true },
  })

  if (!existingOrg) return

  console.log('  Clearing existing demo data...')

  const [candidates, jobs, users] = await Promise.all([
    db.candidate.findMany({
      where: { organizationId: existingOrg.id },
      select: { id: true },
    }),
    db.job.findMany({
      where: { organizationId: existingOrg.id },
      select: { id: true },
    }),
    db.user.findMany({
      where: { email: { in: USERS.map((u) => u.email) } },
      select: { id: true },
    }),
  ])

  const candidateIds = candidates.map((candidate) => candidate.id)
  const jobIds = jobs.map((job) => job.id)
  const userIds = users.map((user) => user.id)

  const applications = await db.application.findMany({
    where: {
      OR: [{ candidateId: { in: candidateIds } }, { jobId: { in: jobIds } }],
    },
    select: { id: true },
  })
  const applicationIds = applications.map((application) => application.id)

  await db.$transaction([
    db.notification.deleteMany({ where: { userId: { in: userIds } } }),
    db.activityLog.deleteMany({ where: { organizationId: existingOrg.id } }),
    db.auditLog.deleteMany({ where: { organizationId: existingOrg.id } }),
    db.note.deleteMany({
      where: {
        OR: [{ candidateId: { in: candidateIds } }, { applicationId: { in: applicationIds } }],
      },
    }),
    db.interview.deleteMany({
      where: {
        OR: [{ candidateId: { in: candidateIds } }, { applicationId: { in: applicationIds } }],
      },
    }),
    db.application.deleteMany({ where: { id: { in: applicationIds } } }),
    db.candidate.deleteMany({ where: { id: { in: candidateIds } } }),
    db.job.deleteMany({ where: { id: { in: jobIds } } }),
    db.invitation.deleteMany({ where: { organizationId: existingOrg.id } }),
    db.rolePermission.deleteMany({}),
    db.role.deleteMany({ where: { organizationId: existingOrg.id } }),
    db.team.deleteMany({ where: { organizationId: existingOrg.id } }),
    db.permission.deleteMany({}),
  ])
}

const JOBS: Array<{
  title: string
  department: string
  location: string
  employmentType: EmploymentType
  salaryMin: number
  salaryMax: number
  description: string
  requirements: string
  benefits: string
  status: JobStatus
  isRemote: boolean
  experienceLevel: string
}> = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    employmentType: 'FULL_TIME',
    salaryMin: 150000,
    salaryMax: 200000,
    description:
      'We are looking for a Senior Frontend Engineer to join our product team. You will work closely with designers and backend engineers to build performant, accessible, and beautiful user interfaces using React and TypeScript.',
    requirements:
      '5+ years of frontend experience\nDeep expertise in React and TypeScript\nStrong understanding of web performance\nExperience with modern CSS (Tailwind preferred)\nFamiliarity with testing (Vitest/Jest, Playwright)',
    benefits:
      'Competitive salary + equity\nHealth, dental, and vision insurance\nFlexible remote work policy\n$2,000 learning stipend\nUnlimited PTO',
    status: 'OPEN',
    isRemote: true,
    experienceLevel: 'Senior',
  },
  {
    title: 'Backend Engineer — Node.js',
    department: 'Engineering',
    location: 'New York, NY',
    employmentType: 'FULL_TIME',
    salaryMin: 140000,
    salaryMax: 185000,
    description:
      'Join our backend team to design and build scalable APIs, microservices, and data pipelines. You will own large surface areas of our product infrastructure.',
    requirements:
      '4+ years of Node.js experience\nStrong PostgreSQL and query optimization skills\nExperience with REST and GraphQL APIs\nFamiliarity with Docker and Kubernetes\nTDD mindset',
    benefits:
      'Competitive salary + equity\nRemote-friendly\nMedical, dental, vision\nHome office stipend',
    status: 'OPEN',
    isRemote: false,
    experienceLevel: 'Mid-Senior',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Austin, TX',
    employmentType: 'FULL_TIME',
    salaryMin: 120000,
    salaryMax: 160000,
    description:
      'We need a talented Product Designer to own design from concept to production. You will conduct user research, create wireframes, and partner closely with engineers.',
    requirements:
      '3+ years of product design\nStrong Figma skills\nPortfolio showing end-to-end design work\nExperience with design systems\nBonus: motion design skills',
    benefits: 'Competitive salary + equity\nFlexible hours\nDesign tool budget\nConference stipend',
    status: 'OPEN',
    isRemote: true,
    experienceLevel: 'Mid',
  },
  {
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'Remote',
    employmentType: 'FULL_TIME',
    salaryMin: 130000,
    salaryMax: 175000,
    description:
      'Own our CI/CD pipelines, cloud infrastructure, and observability stack. Work with engineering teams to improve deployment velocity and system reliability.',
    requirements:
      '4+ years in DevOps/SRE roles\nStrong AWS/GCP knowledge\nTerraform and IaC experience\nKubernetes in production\nExperience with Datadog or similar',
    benefits: 'Fully remote\nCompetitive salary\nEquity\nTop-tier hardware',
    status: 'OPEN',
    isRemote: true,
    experienceLevel: 'Senior',
  },
  {
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Chicago, IL',
    employmentType: 'FULL_TIME',
    salaryMin: 90000,
    salaryMax: 120000,
    description:
      'Lead our demand generation and content marketing efforts. Own the marketing funnel from awareness to conversion.',
    requirements:
      '5+ years B2B SaaS marketing\nStrong analytical skills\nExperience with HubSpot\nContent and SEO strategy experience',
    benefits: 'Hybrid work\nGenerous PTO\nHealth benefits\nMarketing budget',
    status: 'PAUSED',
    isRemote: false,
    experienceLevel: 'Manager',
  },
  {
    title: 'Junior QA Engineer',
    department: 'Engineering',
    location: 'Remote',
    employmentType: 'FULL_TIME',
    salaryMin: 70000,
    salaryMax: 95000,
    description:
      'Help us maintain and improve the quality of our product. Write automated test suites and participate in sprint ceremonies.',
    requirements:
      '1-2 years QA experience\nFamiliarity with Playwright or Cypress\nBasic scripting in JavaScript/TypeScript\nAttention to detail',
    benefits: 'Fully remote\nGrowth opportunities\nHealth benefits',
    status: 'DRAFT',
    isRemote: true,
    experienceLevel: 'Junior',
  },
]

const CANDIDATE_DATA: Array<{
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  experience: number
  education: string
  skills: string[]
  source: string
  linkedin: string
}> = [
  {
    firstName: 'Jordan',
    lastName: 'Rivera',
    email: 'jordan.rivera@example.com',
    phone: '+1 415 555 0101',
    location: 'San Francisco, CA',
    experience: 6,
    education: 'BS Computer Science, Stanford University',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Postgres'],
    source: 'LinkedIn',
    linkedin: 'https://linkedin.com/in/jordan-rivera',
  },
  {
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'priya.nair@example.com',
    phone: '+1 212 555 0202',
    location: 'New York, NY',
    experience: 4,
    education: 'MS Software Engineering, Columbia University',
    skills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Docker'],
    source: 'Referral',
    linkedin: 'https://linkedin.com/in/priya-nair',
  },
  {
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'marcus.johnson@example.com',
    phone: '+1 512 555 0303',
    location: 'Austin, TX',
    experience: 3,
    education: 'BA Graphic Design, UT Austin',
    skills: ['Figma', 'Sketch', 'Design Systems', 'Prototyping', 'User Research'],
    source: 'Job Board',
    linkedin: 'https://linkedin.com/in/marcus-johnson',
  },
  {
    firstName: 'Yuki',
    lastName: 'Tanaka',
    email: 'yuki.tanaka@example.com',
    phone: '+1 206 555 0404',
    location: 'Seattle, WA',
    experience: 7,
    education: 'BS Electrical Engineering, University of Washington',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'GCP', 'CI/CD', 'Datadog'],
    source: 'LinkedIn',
    linkedin: 'https://linkedin.com/in/yuki-tanaka',
  },
  {
    firstName: 'Amara',
    lastName: 'Osei',
    email: 'amara.osei@example.com',
    phone: '+1 617 555 0505',
    location: 'Boston, MA',
    experience: 5,
    education: 'MBA, Harvard Business School',
    skills: ['HubSpot', 'SEO', 'Content Strategy', 'Analytics', 'SEM'],
    source: 'Company Website',
    linkedin: 'https://linkedin.com/in/amara-osei',
  },
  {
    firstName: 'Liam',
    lastName: 'O\'Brien',
    email: 'liam.obrien@example.com',
    phone: '+1 312 555 0606',
    location: 'Chicago, IL',
    experience: 2,
    education: 'BS Information Technology, DePaul University',
    skills: ['Playwright', 'JavaScript', 'Selenium', 'Postman', 'Jira'],
    source: 'Indeed',
    linkedin: 'https://linkedin.com/in/liam-obrien',
  },
  {
    firstName: 'Sofia',
    lastName: 'Rossi',
    email: 'sofia.rossi@example.com',
    phone: '+1 415 555 0707',
    location: 'San Francisco, CA',
    experience: 8,
    education: 'MS Computer Science, MIT',
    skills: ['React', 'Vue', 'TypeScript', 'Performance', 'Accessibility'],
    source: 'LinkedIn',
    linkedin: 'https://linkedin.com/in/sofia-rossi',
  },
  {
    firstName: 'Chen',
    lastName: 'Wei',
    email: 'chen.wei@example.com',
    phone: '+1 650 555 0808',
    location: 'Palo Alto, CA',
    experience: 5,
    education: 'BS Computer Science, Caltech',
    skills: ['Go', 'Kubernetes', 'gRPC', 'PostgreSQL', 'Redis'],
    source: 'Referral',
    linkedin: 'https://linkedin.com/in/chen-wei',
  },
  {
    firstName: 'Fatima',
    lastName: 'Al-Hassan',
    email: 'fatima.alhassan@example.com',
    phone: '+1 202 555 0909',
    location: 'Washington, DC',
    experience: 3,
    education: 'BA Communications, Georgetown University',
    skills: ['Content Marketing', 'Copywriting', 'SEO', 'Social Media'],
    source: 'Job Board',
    linkedin: 'https://linkedin.com/in/fatima-alhassan',
  },
  {
    firstName: 'Noah',
    lastName: 'Schmidt',
    email: 'noah.schmidt@example.com',
    phone: '+1 971 555 1010',
    location: 'Portland, OR',
    experience: 1,
    education: 'BS Computer Science, Oregon State University',
    skills: ['JavaScript', 'Cypress', 'QA', 'Jira', 'Git'],
    source: 'Campus Recruiting',
    linkedin: 'https://linkedin.com/in/noah-schmidt',
  },
]

// Application stage progressions for realism
// Maps candidateIndex → [jobIndex, stage, score, daysAgoApplied]
const APPLICATION_MAP: Array<[number, number, ApplicationStage, number, number]> = [
  // Jordan Rivera → Senior Frontend Engineer (deep in pipeline)
  [0, 0, 'OFFER', 92, 30],
  // Priya Nair → Backend Engineer (HR Round)
  [1, 1, 'HR_ROUND', 85, 22],
  // Marcus Johnson → Product Designer (Technical stage)
  [2, 2, 'TECHNICAL', 78, 18],
  // Yuki Tanaka → DevOps Engineer (Interview stage)
  [3, 3, 'INTERVIEW', 88, 15],
  // Amara Osei → Marketing Manager (Screening)
  [4, 4, 'SCREENING', 72, 10],
  // Liam O'Brien → Junior QA Engineer (Applied)
  [5, 5, 'APPLIED', 60, 5],
  // Sofia Rossi → Senior Frontend Engineer (Hired!)
  [6, 0, 'HIRED', 96, 60],
  // Chen Wei → Backend Engineer (Rejected at Technical)
  [7, 1, 'REJECTED', 55, 45],
  // Fatima Al-Hassan → Marketing Manager (Interview)
  [8, 4, 'INTERVIEW', 80, 20],
  // Noah Schmidt → Junior QA Engineer (Screening)
  [9, 5, 'SCREENING', 65, 8],
  // Cross-applications for richer data
  // Jordan also applied for Backend role (Screening)
  [0, 1, 'SCREENING', 70, 25],
  // Priya also applied for DevOps role (Applied)
  [1, 3, 'APPLIED', 65, 12],
]

// Interview definitions: [candidateIdx, jobIdx, interviewerUserIdx, daysOffset, type, status, rating, feedback]
type InterviewDef = [
  number,
  number,
  number,
  number,
  InterviewType,
  InterviewStatus,
  number | null,
  string | null,
]

const INTERVIEW_DEFS: InterviewDef[] = [
  [0, 0, 3, 25, 'PHONE', 'COMPLETED', 4, 'Strong communicator, solid React fundamentals. Recommend moving forward.'],
  [0, 0, 3, 20, 'TECHNICAL', 'COMPLETED', 5, 'Exceptional problem-solving. Clean code, great TypeScript knowledge. Strong hire.'],
  [0, 0, 2, 15, 'VIDEO', 'COMPLETED', 4, 'Culture fit excellent. Collaborative, asks smart questions. Good senior-level thinking.'],
  [1, 1, 3, 18, 'PHONE', 'COMPLETED', 4, 'Node.js skills are solid. Good understanding of async patterns and DB indexing.'],
  [1, 1, 2, 14, 'TECHNICAL', 'COMPLETED', 3, 'SQL queries needed work but overall acceptable for the role. Recommend HR round.'],
  [2, 2, 3, 14, 'VIDEO', 'COMPLETED', 4, 'Portfolio is impressive. Good design thinking. Needs stronger systems experience.'],
  [3, 3, 3, 10, 'PHONE', 'COMPLETED', 5, 'Yuki knows Kubernetes deeply. Infrastructure thinking is top-tier. Must hire.'],
  [6, 0, 3, 55, 'PHONE', 'COMPLETED', 5, 'Outstanding. Best frontend candidate we have seen this cycle.'],
  [6, 0, 3, 50, 'TECHNICAL', 'COMPLETED', 5, 'Perfect score on live coding. Ship it.'],
  [8, 4, 3, 16, 'VIDEO', 'COMPLETED', 4, 'Strong marketing background. Data-driven approach. Good cultural fit.'],
  // Upcoming interviews
  [4, 4, 3, -3, 'VIDEO', 'SCHEDULED', null, null],
  [9, 5, 3, -5, 'PHONE', 'SCHEDULED', null, null],
]

const PERMISSIONS = [
  'jobs:create', 'jobs:read', 'jobs:update', 'jobs:delete', 'jobs:archive',
  'candidates:create', 'candidates:read', 'candidates:update', 'candidates:delete',
  'applications:create', 'applications:read', 'applications:update', 'applications:move',
  'interviews:create', 'interviews:read', 'interviews:update', 'interviews:delete', 'interviews:feedback',
  'reports:read', 'users:manage', 'organization:manage', 'analytics:read'
]

const ROLE_PERMISSIONS_SEED: Record<string, string[]> = {
  SUPER_ADMIN: [
    'jobs:create', 'jobs:read', 'jobs:update', 'jobs:delete', 'jobs:archive',
    'candidates:create', 'candidates:read', 'candidates:update', 'candidates:delete',
    'applications:create', 'applications:read', 'applications:update', 'applications:move',
    'interviews:create', 'interviews:read', 'interviews:update', 'interviews:delete', 'interviews:feedback',
    'reports:read', 'users:manage', 'organization:manage', 'analytics:read'
  ],
  RECRUITER: [
    'jobs:create', 'jobs:read', 'jobs:update', 'jobs:archive',
    'candidates:create', 'candidates:read', 'candidates:update',
    'applications:create', 'applications:read', 'applications:update', 'applications:move',
    'interviews:create', 'interviews:read', 'interviews:update', 'interviews:delete',
    'reports:read', 'analytics:read', 'organization:manage'
  ],
  HIRING_MANAGER: [
    'jobs:read', 'jobs:update',
    'candidates:read',
    'applications:read', 'applications:update', 'applications:move',
    'interviews:read', 'interviews:update', 'interviews:feedback',
    'reports:read', 'analytics:read'
  ],
  INTERVIEWER: [
    'jobs:read',
    'candidates:read',
    'applications:read',
    'interviews:read', 'interviews:feedback'
  ],
  VIEWER: [
    'jobs:read', 'candidates:read', 'applications:read', 'interviews:read'
  ]
}

const TEAMS = [
  { name: 'Engineering', description: 'Software engineering, QA, DevOps, and infrastructure' },
  { name: 'Product', description: 'Product management and product strategy' },
  { name: 'Design', description: 'Product design, UX, and brand design' },
  { name: 'Marketing', description: 'Brand marketing, SEO, and demand generation' },
  { name: 'Operations', description: 'Internal operations and business functions' }
]

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function main() {
  await resetSeedData()
  console.log('🌱 Starting seed...')

  // ── Seeding Default SaaS Plans ───────────────────────────────────────────────
  console.log('  Creating default plans...')
  const starterPlan = await db.plan.upsert({
    where: { name: 'STARTER' },
    update: {
      monthlyPrice: 29,
      yearlyPrice: 279,
      maxUsers: 5,
      maxJobs: 20,
      maxCandidates: 500,
      features: ['5 team members', '20 active jobs', '500 candidates', 'Basic analytics'],
    },
    create: {
      name: 'STARTER',
      monthlyPrice: 29,
      yearlyPrice: 279,
      maxUsers: 5,
      maxJobs: 20,
      maxCandidates: 500,
      features: ['5 team members', '20 active jobs', '500 candidates', 'Basic analytics'],
    },
  })

  const proPlan = await db.plan.upsert({
    where: { name: 'PROFESSIONAL' },
    update: {
      monthlyPrice: 99,
      yearlyPrice: 949,
      maxUsers: 999999,
      maxJobs: 999999,
      maxCandidates: 999999,
      features: ['Unlimited team members', 'Unlimited jobs', 'Unlimited candidates', 'Advanced analytics'],
    },
    create: {
      name: 'PROFESSIONAL',
      monthlyPrice: 99,
      yearlyPrice: 949,
      maxUsers: 999999,
      maxJobs: 999999,
      maxCandidates: 999999,
      features: ['Unlimited team members', 'Unlimited jobs', 'Unlimited candidates', 'Advanced analytics'],
    },
  })

  const enterprisePlan = await db.plan.upsert({
    where: { name: 'ENTERPRISE' },
    update: {
      monthlyPrice: 0,
      yearlyPrice: 0,
      maxUsers: 999999,
      maxJobs: 999999,
      maxCandidates: 999999,
      features: ['SSO', 'API access', 'White-label branding', 'Dedicated support'],
    },
    create: {
      name: 'ENTERPRISE',
      monthlyPrice: 0,
      yearlyPrice: 0,
      maxUsers: 999999,
      maxJobs: 999999,
      maxCandidates: 999999,
      features: ['SSO', 'API access', 'White-label branding', 'Dedicated support'],
    },
  })

  // ── 1. Organization ──────────────────────────────────────────────────────────
  console.log('  Creating organization...')
  const org = await db.organization.upsert({
    where: { slug: ORG.slug },
    update: ORG,
    create: ORG,
  })

  // Create default Subscription for org
  const subPeriodEnd = new Date()
  subPeriodEnd.setFullYear(subPeriodEnd.getFullYear() + 1)
  await db.subscription.upsert({
    where: { organizationId: org.id },
    update: { planId: proPlan.id },
    create: {
      organizationId: org.id,
      planId: proPlan.id,
      status: 'ACTIVE',
      billingPeriod: 'YEARLY',
      currentPeriodEnd: subPeriodEnd,
    },
  })

  // ── 2. Users ─────────────────────────────────────────────────────────────────
  // Create Permissions
  console.log('  Creating dynamic permissions...')
  const dbPermissions: Record<string, any> = {}
  for (const perm of PERMISSIONS) {
    const dbPerm = await db.permission.upsert({
      where: { name: perm },
      update: {},
      create: { name: perm, description: `Permission to perform ${perm.replace(':', ' ')}` },
    })
    dbPermissions[perm] = dbPerm
  }

  // Create Roles & RolePermissions
  console.log('  Creating dynamic roles...')
  const dbRoles: Record<string, any> = {}
  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS_SEED)) {
    const dbRole = await db.role.upsert({
      where: { name_organizationId: { name: roleName, organizationId: org.id } },
      update: { isSystem: true },
      create: { name: roleName, description: `${roleName} default system role`, organizationId: org.id, isSystem: true },
    })
    dbRoles[roleName] = dbRole

    // Delete existing permissions for this role and re-insert
    await db.rolePermission.deleteMany({ where: { roleId: dbRole.id } })
    await db.rolePermission.createMany({
      data: permissions.map(pName => ({
        roleId: dbRole.id,
        permissionId: dbPermissions[pName].id
      }))
    })
  }

  // Create Teams
  console.log('  Creating dynamic teams...')
  const dbTeams: Record<string, any> = {}
  for (const team of TEAMS) {
    const dbTeam = await db.team.upsert({
      where: { name_organizationId: { name: team.name, organizationId: org.id } },
      update: { description: team.description },
      create: { name: team.name, description: team.description, organizationId: org.id },
    })
    dbTeams[team.name] = dbTeam
  }

  console.log('  Creating users...')
  const createdUsers: Awaited<ReturnType<typeof db.user.upsert>>[] = []

  // Helper to map email to a seeded team
  const getUserTeam = (email: string) => {
    if (email === 'bob@acmecorp.example.com') return dbTeams['Product']?.id
    if (email === 'david@acmecorp.example.com') return dbTeams['Operations']?.id
    return dbTeams['Engineering']?.id // default Engineering
  }

  for (const u of USERS) {
    const hash = await hashPassword(u.password)
    const customRoleId = dbRoles[u.role]?.id
    const teamId = getUserTeam(u.email)
    const user = await db.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        passwordHash: hash,
        role: u.role,
        avatar: u.avatar,
        emailVerified: new Date(),
        organizationId: org.id,
        isActive: true,
        lastLoginAt: daysAgo(1),
        customRoleId,
        teamId,
      },
      create: {
        name: u.name,
        email: u.email,
        passwordHash: hash,
        role: u.role,
        avatar: u.avatar,
        emailVerified: new Date(),
        organizationId: org.id,
        isActive: true,
        lastLoginAt: daysAgo(1),
        customRoleId,
        teamId,
      },
    })
    createdUsers.push(user)
  }

  // Convenient references
  const demoUser = createdUsers[0]!   // recruiter@hiretrack.ai — RECRUITER (demoUser variable kept to avoid breaking rest of code references)
  const adminUser = createdUsers[1]!  // admin@hiretrack.ai — SUPER_ADMIN
  const candidateUser = createdUsers[2]! // candidate@hiretrack.ai — CANDIDATE
  const hmUser = createdUsers[3]!     // bob — HIRING_MANAGER
  const interviewerUser = createdUsers[4]! // carol — INTERVIEWER

  // ── 3. Jobs ──────────────────────────────────────────────────────────────────
  console.log('  Creating jobs...')
  const createdJobs: Awaited<ReturnType<typeof db.job.create>>[] = []

  // Helper to map job title / department to seeded team
  const getJobTeam = (title: string, dept: string) => {
    if (dept === 'Design') return dbTeams['Design']?.id
    if (dept === 'Marketing') return dbTeams['Marketing']?.id
    if (dept === 'Product') return dbTeams['Product']?.id
    return dbTeams['Engineering']?.id // default Engineering
  }

  for (let i = 0; i < JOBS.length; i++) {
    const j = JOBS[i]!
    const teamId = getJobTeam(j.title, j.department)
    const job = await db.job.create({
      data: {
        ...j,
        organizationId: org.id,
        hiringManagerId: hmUser.id,
        createdById: demoUser.id,
        publishedAt: j.status === 'OPEN' ? daysAgo(20 + i * 3) : null,
        createdAt: daysAgo(25 + i * 3),
        teamId,
      },
    })
    createdJobs.push(job)

    // Activity log for job creation
    await db.activityLog.create({
      data: {
        actorId: demoUser.id,
        entityType: 'JOB' as EntityType,
        entityId: job.id,
        action: 'CREATED' as ActivityAction,
        jobId: job.id,
        organizationId: org.id,
        metadata: { jobTitle: job.title },
        createdAt: daysAgo(25 + i * 3),
      },
    })
  }

  // ── 4. Candidates ─────────────────────────────────────────────────────────────
  console.log('  Creating candidates...')
  const createdCandidates: Awaited<ReturnType<typeof db.candidate.create>>[] = []

  for (let i = 0; i < CANDIDATE_DATA.length; i++) {
    const c = CANDIDATE_DATA[i]!
    const candidate = await db.candidate.create({
      data: {
        ...c,
        organizationId: org.id,
        status: 'ACTIVE' as CandidateStatus,
        resumeUrl: `https://example.com/resumes/${c.firstName.toLowerCase()}-${c.lastName.toLowerCase()}.pdf`,
        resumeFileName: `${c.firstName}-${c.lastName}-Resume.pdf`,
        createdAt: daysAgo(35 + i * 2),
      },
    })
    createdCandidates.push(candidate)

    await db.activityLog.create({
      data: {
        actorId: demoUser.id,
        entityType: 'CANDIDATE' as EntityType,
        entityId: candidate.id,
        action: 'CREATED' as ActivityAction,
        candidateId: candidate.id,
        organizationId: org.id,
        metadata: { name: `${candidate.firstName} ${candidate.lastName}` },
        createdAt: daysAgo(35 + i * 2),
      },
    })
  }

  // ── 5. Applications ───────────────────────────────────────────────────────────
  console.log('  Creating applications...')
  const createdApplications: Awaited<ReturnType<typeof db.application.create>>[] = []

  for (const [candIdx, jobIdx, stage, score, daysAgoApplied] of APPLICATION_MAP) {
    const candidate = createdCandidates[candIdx]
    const job = createdJobs[jobIdx]
    if (!candidate || !job) continue

    // Skip if this unique pair already exists (upsert not supported with compound unique easily)
    const existing = await db.application.findUnique({
      where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } },
    })
    if (existing) {
      createdApplications.push(existing)
      continue
    }

    const appliedDate = daysAgo(daysAgoApplied)
    const app = await db.application.create({
      data: {
        candidateId: candidate.id,
        jobId: job.id,
        stage,
        score,
        appliedAt: appliedDate,
        createdAt: appliedDate,
        hiredAt: stage === 'HIRED' ? daysAgo(daysAgoApplied - 10) : null,
        rejectedAt: stage === 'REJECTED' ? daysAgo(daysAgoApplied - 15) : null,
      },
    })
    createdApplications.push(app)

    // Log the application creation
    await db.activityLog.create({
      data: {
        actorId: demoUser.id,
        entityType: 'APPLICATION' as EntityType,
        entityId: app.id,
        action: 'CREATED' as ActivityAction,
        candidateId: candidate.id,
        applicationId: app.id,
        jobId: job.id,
        organizationId: org.id,
        metadata: { stage, jobTitle: job.title, candidateName: `${candidate.firstName} ${candidate.lastName}` },
        createdAt: appliedDate,
      },
    })

    // Log stage progressions for advanced-stage apps
    const stages: ApplicationStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'TECHNICAL', 'HR_ROUND', 'OFFER', 'HIRED']
    const stageIndex = stages.indexOf(stage as ApplicationStage)
    if (stageIndex > 0) {
      for (let s = 1; s <= stageIndex; s++) {
        await db.activityLog.create({
          data: {
            actorId: demoUser.id,
            entityType: 'APPLICATION' as EntityType,
            entityId: app.id,
            action: 'STAGE_CHANGED' as ActivityAction,
            candidateId: candidate.id,
            applicationId: app.id,
            jobId: job.id,
            organizationId: org.id,
            metadata: {
              from: stages[s - 1],
              to: stages[s],
              jobTitle: job.title,
            },
            createdAt: daysAgo(daysAgoApplied - s * 3),
          },
        })
      }
    }
  }

  // ── 6. Interviews ─────────────────────────────────────────────────────────────
  console.log('  Creating interviews...')

  for (const [candIdx, jobIdx, , daysOffset, type, status, rating, feedback] of INTERVIEW_DEFS) {
    const candidate = createdCandidates[candIdx]
    const job = createdJobs[jobIdx]
    if (!candidate || !job) continue

    // Find the matching application
    const application = createdApplications.find(
      (a) => a.candidateId === candidate.id && a.jobId === job.id
    )
    if (!application) continue

    // Past interviews are daysAgo, future are daysFromNow
    const scheduledAt = daysOffset >= 0 ? daysAgo(daysOffset) : daysFromNow(-daysOffset)

    const interview = await db.interview.create({
      data: {
        candidateId: candidate.id,
        applicationId: application.id,
        interviewerId: interviewerUser.id,
        scheduledAt,
        duration: 60,
        type,
        status,
        rating,
        feedback,
        notes: status === 'SCHEDULED' ? 'Please review resume beforehand.' : null,
        location: type === 'VIDEO' ? 'https://meet.google.com/abc-defg-hij' : null,
      },
    })

    await db.activityLog.create({
      data: {
        actorId: demoUser.id,
        entityType: 'INTERVIEW' as EntityType,
        entityId: interview.id,
        action: status === 'COMPLETED' ? 'INTERVIEW_COMPLETED' as ActivityAction : 'INTERVIEW_SCHEDULED' as ActivityAction,
        candidateId: candidate.id,
        applicationId: application.id,
        jobId: job.id,
        organizationId: org.id,
        metadata: { type, status, interviewerName: interviewerUser.name },
        createdAt: scheduledAt,
      },
    })
  }

  // ── 7. Notes ──────────────────────────────────────────────────────────────────
  console.log('  Creating notes...')

  const noteContents: Array<[number, number, string, boolean]> = [
    [0, 0, 'Jordan has an impressive portfolio. Strong React and TypeScript skills confirmed via GitHub review. Fast response time.', true],
    [0, 0, 'Reference check with previous manager came back extremely positive. Described as a 10x engineer.', false],
    [1, 1, 'Priya mentioned she is interviewing at two other companies. We need to move fast.', true],
    [2, 2, 'Marcus\'s case study presentation was one of the best we\'ve seen this hiring cycle.', false],
    [6, 0, 'Sofia accepted the offer on 2026-06-15. Start date confirmed for August 1st.', true],
    [7, 1, 'Chen struggled with the distributed systems questions. Decided to pass on this cycle but would consider for a more junior role.', false],
  ]

  for (const [candIdx, jobIdx, content, isPinned] of noteContents) {
    const candidate = createdCandidates[candIdx]
    const job = createdJobs[jobIdx]
    if (!candidate || !job) continue

    const application = createdApplications.find(
      (a) => a.candidateId === candidate.id && a.jobId === job.id
    )

    await db.note.create({
      data: {
        content,
        authorId: demoUser.id,
        candidateId: candidate.id,
        applicationId: application?.id ?? null,
        isPinned,
        createdAt: daysAgo(Math.floor(Math.random() * 20) + 1),
      },
    })

    await db.activityLog.create({
      data: {
        actorId: demoUser.id,
        entityType: 'NOTE' as EntityType,
        entityId: candidate.id,
        action: 'NOTE_ADDED' as ActivityAction,
        candidateId: candidate.id,
        applicationId: application?.id ?? null,
        organizationId: org.id,
        metadata: { preview: content.slice(0, 60) + '...' },
        createdAt: daysAgo(Math.floor(Math.random() * 20) + 1),
      },
    })
  }

  // ── 8. Notifications ──────────────────────────────────────────────────────────
  console.log('  Creating notifications...')

  const notifications: Array<{
    userId: string
    title: string
    body: string
    link: string
    read: boolean
  }> = [
    {
      userId: demoUser.id,
      title: 'New application received',
      body: 'Noah Schmidt applied for Junior QA Engineer.',
      link: '/candidates',
      read: false,
    },
    {
      userId: demoUser.id,
      title: 'Interview scheduled',
      body: 'Phone screen with Amara Osei is scheduled for tomorrow.',
      link: '/interviews',
      read: false,
    },
    {
      userId: demoUser.id,
      title: 'Offer accepted 🎉',
      body: 'Sofia Rossi accepted the Senior Frontend Engineer offer.',
      link: '/candidates',
      read: true,
    },
    {
      userId: hmUser.id,
      title: 'Feedback requested',
      body: 'Please review interview feedback for Jordan Rivera.',
      link: '/interviews',
      read: false,
    },
    {
      userId: interviewerUser.id,
      title: 'Upcoming interview',
      body: 'You have a phone screen with Amara Osei in 2 days.',
      link: '/interviews',
      read: false,
    },
    {
      userId: adminUser.id,
      title: 'Pipeline update',
      body: 'Jordan Rivera has moved to the Offer stage.',
      link: '/pipeline',
      read: true,
    },
  ]

  for (const n of notifications) {
    await db.notification.create({
      data: {
        ...n,
        readAt: n.read ? daysAgo(1) : null,
        createdAt: daysAgo(Math.floor(Math.random() * 5) + 1),
      },
    })
  }

  // ── 9. Audit Logs ─────────────────────────────────────────────────────────────
  console.log('  Creating audit logs...')

  // Audit log entries for key mutations
  const auditEntries = [
    {
      actorId: adminUser.id,
      entityType: 'ORGANIZATION' as EntityType,
      entityId: org.id,
      action: 'UPDATED',
      previousValue: { plan: 'FREE' },
      newValue: { plan: 'PRO' },
    },
    {
      actorId: demoUser.id,
      entityType: 'JOB' as EntityType,
      entityId: createdJobs[0]?.id ?? '',
      action: 'UPDATED',
      previousValue: { status: 'DRAFT' },
      newValue: { status: 'OPEN' },
    },
    {
      actorId: demoUser.id,
      entityType: 'APPLICATION' as EntityType,
      entityId: createdApplications[6]?.id ?? '',
      action: 'UPDATED',
      previousValue: { stage: 'OFFER' },
      newValue: { stage: 'HIRED' },
    },
  ]

  for (const entry of auditEntries) {
    if (!entry.entityId) continue
    await db.auditLog.create({
      data: {
        ...entry,
        organizationId: org.id,
        createdAt: daysAgo(Math.floor(Math.random() * 10) + 1),
      },
    })
  }

  // ── Create environment-based Platform Super Admin ─────────────────────────────
  console.log('  Seeding Platform Super Admin...')
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@hiretrack.ai'
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin1234'
  const superAdminHash = await hashPassword(superAdminPassword)

  await db.user.upsert({
    where: { email: superAdminEmail },
    update: {
      name: 'Platform Super Admin',
      passwordHash: superAdminHash,
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: new Date(),
    },
    create: {
      name: 'Platform Super Admin',
      email: superAdminEmail,
      passwordHash: superAdminHash,
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: new Date(),
    },
  })

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!')
  console.log('─────────────────────────────────────────')
  console.log(`  Organization : ${org.name}`)
  console.log(`  Users        : ${createdUsers.length}`)
  console.log(`  Jobs         : ${createdJobs.length}`)
  console.log(`  Candidates   : ${createdCandidates.length}`)
  console.log(`  Applications : ${createdApplications.length}`)
  console.log(`  Notifications: ${notifications.length}`)
  console.log('─────────────────────────────────────────')
  console.log('  Demo login   : demo@hiretrack.ai')
  console.log('  Password     : demo1234')
  console.log('─────────────────────────────────────────\n')
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
