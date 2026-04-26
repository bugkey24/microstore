import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await fetch(`${config.authServiceUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ success: false, message: data.message || 'Registration failed', errors: data.errors }, { status: res.status })
    }

    return NextResponse.json({ success: true, message: 'Registration successful' })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
