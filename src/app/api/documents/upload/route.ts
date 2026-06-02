import { NextRequest, NextResponse } from 'next/server'
import { getBackendBaseUrl } from '@/lib/backend-config'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const backendUrl = getBackendBaseUrl()
    console.log('Backend URL:', backendUrl)
    console.log('NEXT_PUBLIC_PYTHON_BACKEND_URL env:', process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL)
    console.log('PYTHON_BACKEND_URL env:', process.env.PYTHON_BACKEND_URL)

    const incomingFormData = await request.formData()
    const file = incomingFormData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const outboundFormData = new FormData()
    const blob = new Blob([buffer], { type: file.type || 'application/octet-stream' })
    outboundFormData.append('file', blob, file.name)

    const response = await fetch(`${backendUrl}/upload`, {
      method: 'POST',
      body: outboundFormData,
      cache: 'no-store',
      signal: AbortSignal.timeout(300000),
    })

    const responseText = await response.text()
    console.log('Backend upload status:', response.status)
    console.log('Backend upload body:', responseText)

    let data
    try {
      data = responseText ? JSON.parse(responseText) : {}
    } catch {
      data = { detail: responseText || 'Upload failed' }
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error in /api/documents/upload:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 502 }
    )
  }
}
