import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/config'

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function GET() {
  try {
    const authHeader = await getAuthHeader()
    const res = await fetch(`${config.orderServiceUrl}/orders`, {
      headers: authHeader,
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = await getAuthHeader()
    const body = await request.json()
    const res = await fetch(`${config.orderServiceUrl}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
