import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getMondialRelayCredentials } from '@/lib/carriers/credentials'
import { searchRelayPoints } from '@/lib/carriers/mondial-relay'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const zipCode = searchParams.get('zipCode')
  const country = searchParams.get('country') || 'FR'

  if (!zipCode) {
    return NextResponse.json({ error: 'Code postal requis' }, { status: 400 })
  }

  const credentials = await getMondialRelayCredentials()
  if (!credentials) {
    return NextResponse.json(
      { error: 'Credentials Mondial Relay non configurés. Allez dans Paramètres > Transporteurs.' },
      { status: 400 }
    )
  }

  try {
    const relayPoints = await searchRelayPoints({
      enseigne: credentials.enseigne,
      privateKey: credentials.privateKey,
      country,
      zipCode,
      nbResults: 10
    })

    return NextResponse.json({ relayPoints })
  } catch (error: any) {
    console.error('[Relay Points]', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la recherche de points relais' },
      { status: 500 }
    )
  }
}
