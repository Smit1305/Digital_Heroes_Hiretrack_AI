import { generateCsrfToken, validateCsrfToken, extractCsrfToken } from '@/lib/csrf'

describe('CSRF Token', () => {
  describe('generateCsrfToken', () => {
    it('generates a string with three dot-separated parts', () => {
      const token = generateCsrfToken()
      const parts = token.split('.')
      expect(parts.length).toBe(3)
    })

    it('generates unique tokens each time', () => {
      const token1 = generateCsrfToken()
      const token2 = generateCsrfToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('validateCsrfToken', () => {
    it('validates a freshly generated token', () => {
      const token = generateCsrfToken()
      expect(validateCsrfToken(token)).toBe(true)
    })

    it('rejects an empty token', () => {
      expect(validateCsrfToken('')).toBe(false)
    })

    it('rejects a malformed token (wrong parts)', () => {
      expect(validateCsrfToken('foo.bar')).toBe(false)
      expect(validateCsrfToken('foo')).toBe(false)
    })

    it('rejects a tampered token', () => {
      const token = generateCsrfToken()
      const parts = token.split('.')
      parts[2] = 'tampered_signature'
      expect(validateCsrfToken(parts.join('.'))).toBe(false)
    })

    it('rejects a token with tampered nonce', () => {
      const token = generateCsrfToken()
      const parts = token.split('.')
      parts[0] = 'tampered_nonce'
      expect(validateCsrfToken(parts.join('.'))).toBe(false)
    })

    it('rejects a token with invalid timestamp', () => {
      expect(validateCsrfToken('nonce.notanumber.sig')).toBe(false)
    })
  })

  describe('extractCsrfToken', () => {
    it('extracts from X-CSRF-Token header', () => {
      const headers = new Headers({ 'x-csrf-token': 'test-token' })
      expect(extractCsrfToken(headers)).toBe('test-token')
    })

    it('extracts from form data _csrf field', () => {
      const headers = new Headers()
      const formData = new FormData()
      formData.set('_csrf', 'form-token')
      expect(extractCsrfToken(headers, formData)).toBe('form-token')
    })

    it('prefers header over form data', () => {
      const headers = new Headers({ 'x-csrf-token': 'header-token' })
      const formData = new FormData()
      formData.set('_csrf', 'form-token')
      expect(extractCsrfToken(headers, formData)).toBe('header-token')
    })

    it('returns null when no token is found', () => {
      const headers = new Headers()
      expect(extractCsrfToken(headers)).toBeNull()
    })
  })
})
