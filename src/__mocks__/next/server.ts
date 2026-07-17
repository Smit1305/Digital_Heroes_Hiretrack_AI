// Manual mock for next/server used in unit/integration tests
export class NextRequest {
  constructor(public url: string, public init?: RequestInit) {}
  json = async () => ({})
  text = async () => ''
}

export class NextResponse {
  static json(body: unknown, init?: ResponseInit) {
    return { body, init }
  }
  static redirect(url: string) {
    return { url }
  }
  static next() {
    return {}
  }
}

export const userAgent = () => ({ browser: {}, os: {}, device: {} })
