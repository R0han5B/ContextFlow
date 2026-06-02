import { NextRequest, NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/backend-config'

export const runtime = 'nodejs'
const LOCAL_BACKEND_URL = 'http://localhost:8000'

const FALLBACK_ANALYSIS = {
  type: 'factual',
  complexity: 2,
  entities: [],
  chunksNeeded: 3,
  confidence: 50,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const question = typeof body?.question === 'string' ? body.question : ''

    if (!question.trim()) {
      return NextResponse.json({ error: 'Invalid question' }, { status: 400 })
    }

    const backendUrl = getBackendBaseUrl()
    const response = await fetch(`${backendUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
      cache: 'no-store',
    })

    if (response.status === 404 && backendUrl !== LOCAL_BACKEND_URL) {
      const fallbackResponse = await fetch(`${LOCAL_BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
        cache: 'no-store',
      })

      const fallbackData = await fallbackResponse.json()
      return NextResponse.json(fallbackData, { status: fallbackResponse.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error in /api/analyze:', error)
    return NextResponse.json(FALLBACK_ANALYSIS)
  }
}
