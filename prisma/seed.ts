import { PrismaClient, Prisma } from '@prisma/client'
import { scrapeAmdMobaChipsets, scrapeIntelMobaChipsets } from '@/app/api/scrapers/mobachipsets/utils'

const prisma = new PrismaClient()
async function main() {
  if (!await prisma.mobaChipset.findFirst({where: {brand: {name: 'AMD'}}})) {
    console.log("getting AMD chipsets")
    await scrapeAmdMobaChipsets('https://www.amd.com/en/products/processors/chipsets/am4.html')
    await scrapeAmdMobaChipsets('https://www.amd.com/en/products/processors/chipsets/am5.html')
  }

  if (!await prisma.mobaChipset.findFirst({where: {brand: {name: 'Intel'}}})) {
    console.log("getting INTEL chipsets")
    await scrapeIntelMobaChipsets('https://www.intel.com/content/www/us/en/products/details/chipsets/desktop-chipsets/products.html')
  }
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })