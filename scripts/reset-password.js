const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'contact@faith-shop.com'
  const password = 'password123'
  const hashedPassword = await hash(password, 10)

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  })

  console.log(`Password for ${email} reset to ${password}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
