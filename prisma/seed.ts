import { PrismaClient, Prisma } from '@prisma/client'
import { scrapeAmdMobaChipsets, scrapeIntelMobaChipsets } from '@/app/api/scrape/mobachipsets/utils'

const prisma = new PrismaClient()
async function main() {
  if (!await prisma.mobaChipset.findFirst({where: {brand: {name: 'AMD'}}})) {
    console.log("getting AMD chipsets")
    await scrapeAmdMobaChipsets('https://www.amd.com/en/products/processors/chipsets/am4.html')
    await scrapeAmdMobaChipsets('https://www.amd.com/en/products/processors/chipsets/am5.html')
  }

  await scrapeIntelMobaChipsets('https://www.intel.com/content/www/us/en/products/details/chipsets/desktop-chipsets/products.html')
  
    const mobaChipsets = await prisma.gpuChipset.upsert({where: {name: 'GeForce RTX 3050'}, create: {name: 'GeForce RTX 3050'}, update: {name: 'GeForce RTX 3050'}})
    
    try {
      const speed = await prisma.memorySpeed.create({data: {speed: 5200, ddr: "DDR5"}})
    } catch (e) {
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