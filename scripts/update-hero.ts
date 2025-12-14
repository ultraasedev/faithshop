
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating homepage configuration...')

  const configs = [
    { key: 'home_hero_title', value: 'Élégance Urbaine. Message Éternel.' },
    { key: 'home_hero_subtitle', value: 'Dominez la ville avec confort et style. Découvrez l\'ensemble iconique en velours chocolat intense.' },
    { key: 'home_hero_image', value: '/prd/hero/hero-upscaled.png' },
    { key: 'home_hero_cta_text', value: 'Découvrir l\'ensemble' },
    { key: 'home_hero_cta_link', value: '/products/ensemble-velours-jesus-is-king-chocolat' }, // Assuming this is the target product
  ]

  for (const config of configs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: {
        key: config.key,
        value: config.value,
        type: 'text',
        label: config.key,
        category: 'homepage', // Use category instead of group
      },
    })
  }

  console.log('Homepage configuration updated.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
