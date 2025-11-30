import { prisma } from '../lib/prisma'
import { hash } from 'bcryptjs'

async function main() {
  const email = 'contact@faith-shop.com'
  const password = 'password123'
  const hashedPassword = await hash(password, 10)

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        email,
        password: hashedPassword,
        name: 'Admin',
        role: 'SUPER_ADMIN',
      },
    })
    console.log(`User ${email} upserted with password ${password}`)
  } catch (error) {
    console.error('Error upserting user:', error)
  }
}

main()
