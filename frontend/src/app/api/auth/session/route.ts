import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
  }

  return NextResponse.json({ success: true, message: 'Authenticated' })
}
