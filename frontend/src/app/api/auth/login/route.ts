import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await fetch(`${config.authServiceUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ success: false, message: data.message || 'Login failed' }, { status: res.status })
    }

    const { token } = data.data

    // Set httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })

    return NextResponse.json({ success: true, message: 'Login successful' })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
