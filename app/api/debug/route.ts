import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const envCheck = {
    hasDbUrl: !!process.env.DATABASE_URL,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  }

  // Try database connection
  let dbStatus = 'unknown'
  let dbError = null

  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.$queryRaw`SELECT 1`
    dbStatus = 'connected'
  } catch (error: any) {
    dbStatus = 'error'
    dbError = error.message
  }

  return NextResponse.json({
    ...envCheck,
    dbStatus,
    dbError,
  })
}
