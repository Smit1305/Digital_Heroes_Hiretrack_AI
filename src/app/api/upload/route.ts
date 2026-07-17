import { writeFile, mkdir } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded.' },
        { status: 400 }
      )
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit.' },
        { status: 400 }
      )
    }

    // Validate extension
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt']
    const ext = path.extname(file.name).toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF, Word, or TXT files are allowed.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    // Ensure dir exists
    await mkdir(uploadDir, { recursive: true })

    // Generate unique name
    const uniqueFilename = `${crypto.randomUUID()}${ext}`
    const filepath = path.join(uploadDir, uniqueFilename)

    await writeFile(filepath, buffer)
    const fileUrl = `/uploads/${uniqueFilename}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: file.name,
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file.' },
      { status: 500 }
    )
  }
}
