import { NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/backend-config'

export const runtime = 'nodejs'
const LOCAL_BACKEND_URL = 'http://localhost:8000'

export async function POST() {
  try {
    const backendUrl = getBackendBaseUrl()
    const response = await fetch(`${backendUrl}/cleanup`, {
      method: 'DELETE',
      cache: 'no-store',
    })

    if (response.status === 404 && backendUrl !== LOCAL_BACKEND_URL) {
      const fallbackResponse = await fetch(`${LOCAL_BACKEND_URL}/cleanup`, {
        method: 'DELETE',
        cache: 'no-store',
      })

      const fallbackData = await fallbackResponse.json()
      return NextResponse.json(fallbackData, { status: fallbackResponse.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error in /api/documents/cleanup:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Cleanup failed',
      },
      { status: 502 }
    )
  }
}
