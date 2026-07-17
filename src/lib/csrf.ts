import { randomBytes, createHmac } from 'crypto'

const CSRF_SECRET = process.env.CSRF_SECRET ?? process.env.AUTH_SECRET ?? 'hiretrack-csrf-fallback-secret'
const TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

/**
 * Generate a signed CSRF token for double-submit cookie pattern.
 * The token embeds a timestamp for expiry validation.
 */
export function generateCsrfToken(): string {
  const nonce = randomBytes(16).toString('hex')
  const timestamp = Date.now().toString()
  const payload = `${nonce}.${timestamp}`
  const signature = createHmac('sha256', CSRF_SECRET).update(payload).digest('hex')
  return `${payload}.${signature}`
}

/**
 * Validate a CSRF token.
 * Checks signature integrity and expiry.
 */
export function validateCsrfToken(token: string): boolean {
  if (!token) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [nonce, timestamp, signature] = parts

  // Verify signature
  const payload = `${nonce}.${timestamp}`
  const expectedSignature = createHmac('sha256', CSRF_SECRET).update(payload).digest('hex')

  if (signature !== expectedSignature) return false

  // Verify expiry
  const tokenTime = parseInt(timestamp, 10)
  if (isNaN(tokenTime)) return false
  if (Date.now() - tokenTime > TOKEN_EXPIRY_MS) return false

  return true
}

/**
 * Extract CSRF token from request headers (X-CSRF-Token) or form data.
 */
export function extractCsrfToken(headers: Headers, formData?: FormData): string | null {
  return (
    headers.get('x-csrf-token') ??
    formData?.get('_csrf')?.toString() ??
    null
  )
}
