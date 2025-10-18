import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward the request to the backend validation service
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/validation/validate-move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error('Backend validation failed')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Move validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Move validation failed' },
      { status: 500 }
    )
  }
}
