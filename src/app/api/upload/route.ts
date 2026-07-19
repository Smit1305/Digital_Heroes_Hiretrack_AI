import { put } from '@vercel/blob'
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

    // Option 1: Use Vercel Blob if token is configured in environment
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const uniqueFilename = `${crypto.randomUUID()}-${file.name}`
        const blob = await put(`resumes/${uniqueFilename}`, buffer, {
          access: 'public',
        })

        return NextResponse.json({
          success: true,
          url: blob.url,
          filename: file.name,
        })
      } catch (blobErr) {
        console.warn('Vercel Blob upload failed, falling back:', blobErr)
      }
    }

    // Option 2: Try local filesystem (works in local dev)
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })

      const uniqueFilename = `${crypto.randomUUID()}${ext}`
      const filepath = path.join(uploadDir, uniqueFilename)

      await writeFile(filepath, buffer)
      const fileUrl = `/uploads/${uniqueFilename}`

      return NextResponse.json({
        success: true,
        url: fileUrl,
        filename: file.name,
      })
    } catch (fsErr) {
      // Option 3: Fallback for Vercel Serverless environment (read-only filesystem)
      console.warn('Local filesystem is read-only. Falling back to Data URL encoding.', fsErr)

      const mimeType = file.type || (ext === '.pdf' ? 'application/pdf' : 'application/octet-stream')
      const base64Data = buffer.toString('base64')
      const dataUrl = `data:${mimeType};base64,${base64Data}`

      return NextResponse.json({
        success: true,
        url: dataUrl,
        filename: file.name,
      })
    }
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file.' },
      { status: 500 }
    )
  }
}
