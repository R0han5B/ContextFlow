import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// In-memory store (demo-safe)
let STORED_TEXT = ''

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Read file as text (works for text-based PDFs / notes)
    const text = await file.text()

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'File contains no readable text' },
        { status: 400 }
      )
    }

    STORED_TEXT = text

    return NextResponse.json({
      success: true,
      message: 'Document uploaded and indexed (demo mode)'
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

// Export getter for answer API
export function getStoredText() {
  return STORED_TEXT
}
