import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateId, email } = body

    if (!templateId || !email) {
      return NextResponse.json(
        { error: 'Missing template ID or email' },
        { status: 400 }
      )
    }

    // Simulate sending a test email
    await new Promise(resolve => setTimeout(resolve, 1000))

    const result = {
      success: true,
      messageId: 'test_' + Date.now(),
      sentTo: email,
      template: templateId,
      sentAt: new Date().toISOString()
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}