/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Sentry from '@sentry/nextjs'
import { env } from './env'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogPayload {
  timestamp: string
  level: string
  message: string
  environment: string
  requestId?: string
  userId?: string
  organizationId?: string
  metadata?: Record<string, any>
  error?: {
    message: string
    stack?: string
    code?: string
  }
}

/**
 * Structured JSON Logger for Production SaaS Observability.
 * Formats logs in clean JSON for cloud monitoring (Sentry, Datadog, AWS CloudWatch, Vercel).
 */
class StructuredLogger {
  private environment: string

  constructor() {
    this.environment = env.NODE_ENV
  }

  private formatMessage(level: LogLevel, message: string, meta: Record<string, any> = {}, error?: any): string {
    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      environment: this.environment,
    }

    // Extract common fields from metadata to promote to top-level fields
    if (meta.requestId) {
      payload.requestId = String(meta.requestId)
      delete meta.requestId
    }
    if (meta.userId) {
      payload.userId = String(meta.userId)
      delete meta.userId
    }
    if (meta.organizationId) {
      payload.organizationId = String(meta.organizationId)
      delete meta.organizationId
    }

    if (Object.keys(meta).length > 0) {
      payload.metadata = meta
    }

    if (error) {
      payload.error = {
        message: error.message || String(error),
        code: error.code || error.status,
      }
      
      // Expose stack traces only in non-production environments to avoid security leaks
      if (this.environment !== 'production' && error.stack) {
        payload.error.stack = error.stack
      }
    }

    return JSON.stringify(payload)
  }

  public info(message: string, meta?: Record<string, any>) {
    console.log(this.formatMessage('info', message, meta))
  }

  public warn(message: string, meta?: Record<string, any>) {
    console.warn(this.formatMessage('warn', message, meta))
  }

  public error(message: string, error?: any, meta?: Record<string, any>) {
    console.error(this.formatMessage('error', message, meta, error))
    
    // Integrate with Sentry
    try {
      Sentry.captureException(error, {
        extra: meta,
      })
    } catch {
      // Sentry fallback silently
    }
  }

  public debug(message: string, meta?: Record<string, any>) {
    if (this.environment !== 'production') {
      console.log(this.formatMessage('debug', message, meta))
    }
  }
}

export const logger = new StructuredLogger()

