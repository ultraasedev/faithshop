import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import { hash } from 'bcryptjs'
import ws from 'ws'

// Configure WebSocket for Node.js
neonConfig.webSocketConstructor = ws

const connectionString = "postgresql://neondb_owner:npg_RM7YnUS4gFIV@ep-tiny-cake-adbyc3l9-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🔧 Fixing admin account...')

  const hashedPassword = await hash('admin123', 12)

  // List all admins
  const allAdmins = await prisma.user.findMany({
    where: {
      OR: [
        { email: 'admin@faith-shop.com' },
        { email: 'contact@faith-shop.com' },
        { email: 'contact@faith-shop.fr' },
        { role: 'SUPER_ADMIN' },
        { role: 'ADMIN' },
      ]
    }
  })

  console.log('Found admins:', allAdmins.map(a => a.email))

  // Check if contact@faith-shop.fr exists
  const targetAdmin = allAdmins.find(a => a.email === 'contact@faith-shop.fr')

  if (targetAdmin) {
    // Just update the password
    await prisma.user.update({
      where: { id: targetAdmin.id },
      data: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      }
    })
    console.log('✅ Password updated for:', targetAdmin.email)
  } else {
    // Delete other admin accounts if they exist
    for (const admin of allAdmins) {
      if (admin.email !== 'contact@faith-shop.fr') {
        console.log('Deleting old admin:', admin.email)
        await prisma.user.delete({ where: { id: admin.id } })
      }
    }

    // Create the correct admin
    const newAdmin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'contact@faith-shop.fr',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        canManageProducts: true,
        canManageOrders: true,
        canManageUsers: true,
        canManageSettings: true,
        canManageDiscounts: true,
        canManageShipping: true,
      }
    })
    console.log('✅ New admin created:', newAdmin.email)
  }

  console.log('')
  console.log('========================================')
  console.log('📧 Email: contact@faith-shop.fr')
  console.log('🔑 Password: admin123')
  console.log('========================================')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
