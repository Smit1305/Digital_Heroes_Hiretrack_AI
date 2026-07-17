import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')?.toLowerCase().trim()

    if (!email) {
      return NextResponse.json({ exists: false })
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    })

    return NextResponse.json({ exists: !!user })
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json({ exists: false }, { status: 500 })
  }
}
