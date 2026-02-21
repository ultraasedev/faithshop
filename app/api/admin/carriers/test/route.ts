import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { testConnection } from '@/lib/carriers/laposte-tracking'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { carrier, apiKey } = await request.json()

  if (carrier === 'laposte') {
    if (!apiKey?.trim()) {
      return NextResponse.json({ ok: false, error: 'Clé API requise' })
    }
    const result = await testConnection(apiKey)
    return NextResponse.json(result)
  }

  return NextResponse.json({ ok: false, error: 'Transporteur non supporté' })
}
