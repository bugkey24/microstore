import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET() {
  try {
    const res = await fetch(`${config.productServiceUrl}/products`)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
