import { prisma } from '../lib/prisma'

async function main() {
  const pages = await prisma.pageContent.findMany({
    select: {
      slug: true,
      title: true,
      content: true
    }
  })

  for (const page of pages) {
    console.log(`\n=== ${page.slug} (${page.title}) ===`)
    try {
      const parsed = JSON.parse(page.content)
      if (parsed.blocks) {
        console.log(`Blocks: ${parsed.blocks.length}`)
        parsed.blocks.forEach((b: any, i: number) => {
          console.log(`  ${i + 1}. ${b.type}`)
        })
      } else if (Array.isArray(parsed)) {
        console.log(`Blocks array: ${parsed.length}`)
        parsed.forEach((b: any, i: number) => {
          console.log(`  ${i + 1}. ${b.type}`)
        })
      } else {
        console.log('Unknown format:', Object.keys(parsed))
      }
    } catch {
      console.log('HTML content (not JSON):', page.content.substring(0, 100))
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
