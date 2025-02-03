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
    
  try {
    await prisma.storageType.createMany({data: [{name: "SSD"}, {name: "7200 RPM"}]})
  } catch (e) {
    console.error(e)
  }
    
  try {
    await prisma.operativeSystem.createMany({data: [
      { name: "Windows 11 Home" },
      { name: "Windows 11 Pro" },
      { name: "macOS Monterey" },
      { name: "Ubuntu 20.04 LTS" },
      { name: "Fedora 35" },
      { name: "Chrome OS" },
      { name: "Windows 10" } 
    ]})
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