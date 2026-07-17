import { auth } from '@/lib/auth'
import type { NextAuthRequest } from 'next-auth'
import { NextResponse } from 'next/server'

// Routes that don't require authentication
const PUBLIC_PREFIXES = [
  '/_next',
  '/api/auth',
  '/favicon.ico',
]

const PUBLIC_PAGES = [
  '/',
  '/features',
  '/pricing',
  '/docs',
  '/faq',
  '/about',
  '/auth/login',
  '/auth/register',
  '/auth/select-account',
  '/auth/accept-invite',
  '/register-company',
  '/checkout',
  '/contact-sales',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify',
  '/auth/error',
  '/candidate/login',
  '/candidate/signup',
  '/candidate/forgot-password',
  '/candidate/reset-password',
  '/candidate/verify-email',
]

const RECRUITER_AUTH_PAGES = [
  '/auth/login',
  '/auth/register',
  '/auth/select-account',
  '/auth/forgot-password',
]

const CANDIDATE_AUTH_PAGES = [
  '/candidate/login',
  '/candidate/signup',
  '/candidate/forgot-password',
  '/candidate/reset-password',
]

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true
  if (PUBLIC_PAGES.includes(pathname)) return true
  // Dynamic careers pages are public
  if (pathname.startsWith('/careers')) return true
  // Static assets
  if (/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$/.test(pathname)) return true
  return false
}

export default auth((req: NextAuthRequest) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // 1. Redirection for public recruiter sign-ups
  if (pathname === '/auth/register') {
    return NextResponse.redirect(new URL('/auth/select-account', req.url))
  }

  // 2. Authenticated User Flow
  if (session?.user) {
    const role = session.user.role

    // Super admin is allowed to access admin routes and standard recruiter routes (if needed),
    // but standard users/candidates cannot access admin routes.
    if (pathname.startsWith('/admin') && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(
        new URL(role === 'CANDIDATE' ? '/candidate/dashboard' : '/dashboard', req.url)
      )
    }

    if (role === 'CANDIDATE') {
      // Candidates cannot access recruiter/admin routes
      const isRecruiterRoute =
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/analytics') ||
        pathname.startsWith('/jobs') ||
        pathname.startsWith('/candidates') ||
        pathname.startsWith('/pipeline') ||
        pathname.startsWith('/interviews') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/admin')

      if (isRecruiterRoute) {
        return NextResponse.redirect(new URL('/candidate/dashboard', req.url))
      }

      // Redirect away from candidate auth pages
      if (CANDIDATE_AUTH_PAGES.includes(pathname)) {
        return NextResponse.redirect(new URL('/candidate/dashboard', req.url))
      }
    } else {
      // Recruiter/Interviewer/Admin/Owner cannot access candidate routes
      if (pathname.startsWith('/candidate') && !CANDIDATE_AUTH_PAGES.includes(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      // Redirect away from recruiter auth pages
      if (RECRUITER_AUTH_PAGES.includes(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  }

  // 3. Unauthenticated Flow
  if (pathname.startsWith('/admin')) {
    const callbackUrl = encodeURIComponent(req.nextUrl.href)
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.url)
    )
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Protect candidate routes
  if (pathname.startsWith('/candidate')) {
    const callbackUrl = encodeURIComponent(req.nextUrl.href)
    return NextResponse.redirect(
      new URL(`/candidate/login?callbackUrl=${callbackUrl}`, req.url)
    )
  }

  // Protect recruiter/admin routes
  const callbackUrl = encodeURIComponent(req.nextUrl.href)
  return NextResponse.redirect(
    new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.url)
  )
})

export const config = {
  matcher: [
    /*
     * Match all paths except API routes, Next.js internals, and static files.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
