import { prisma } from '../lib/prisma'

async function main() {
  try {
    const users = await prisma.user.findMany()
    console.log('Users count:', users.length)
    users.forEach(u => console.log(`- ${u.email} (Role: ${u.role})`))

    const products = await prisma.product.findMany()
    console.log('Products count:', products.length)
    products.forEach(p => console.log(`- ${p.name} (StripeID: ${p.stripeProductId})`))
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
