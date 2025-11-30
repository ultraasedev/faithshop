import { prisma } from '../lib/prisma'
import { hash } from 'bcryptjs'

async function main() {
  const email = 'contact@faith-shop.fr'
  const password = 'password123'
  const hashedPassword = await hash(password, 10)

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      await prisma.user.update({
        where: { email },
        data: { 
          password: hashedPassword,
          role: 'SUPER_ADMIN' 
        },
      })
      console.log(`Updated existing user ${email} with new password and SUPER_ADMIN role`)
    } else {
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Admin',
          role: 'SUPER_ADMIN',
        },
      })
      console.log(`Created new user ${email} with password and SUPER_ADMIN role`)
    }
  } catch (error) {
    console.error('Error upserting user:', error)
  }
}

main()
