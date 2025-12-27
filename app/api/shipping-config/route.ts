import { NextResponse } from 'next/server'
import { getShippingConfig } from '@/app/actions/admin/settings'

// Public API to get shipping configuration
export async function GET() {
  try {
    const config = await getShippingConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching shipping config:', error)
    // Return default values if there's an error
    return NextResponse.json({
      freeShippingThreshold: 50,
      standardShippingPrice: 4.95,
      expressShippingPrice: 9.95,
      processingTime: '1-2 jours ouvrés'
    })
  }
}
