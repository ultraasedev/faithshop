import { NextRequest, NextResponse } from 'next/server'
import { getMondialRelayCredentials } from '@/lib/carriers/credentials'
import { searchRelayPoints } from '@/lib/carriers/mondial-relay'

/**
 * Public API pour rechercher des points relais Mondial Relay
 * Utilisé au checkout pour que le client choisisse son point relais
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const zipCode = searchParams.get('zipCode')
  const country = searchParams.get('country') || 'FR'

  if (!zipCode) {
    return NextResponse.json({ error: 'Code postal requis' }, { status: 400 })
  }

  const credentials = await getMondialRelayCredentials()
  if (!credentials) {
    // Si Mondial Relay pas configuré, retourner un tableau vide (pas une erreur)
    return NextResponse.json({ relayPoints: [] })
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
    console.error('[Relay Points Search]', error)
    return NextResponse.json({ relayPoints: [], error: error.message })
  }
}
