import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const brands = await prisma.brand.createManyAndReturn(
        {
            data: [{brand: 'NVIDIA'}, {brand: 'Intel'}, {brand: 'AMD'}, {brand: 'NZXT'}]
        }
    )
    const products = await prisma.product.createMany(
        {
            data: [{}]
        }
    )
    const gpus = await prisma.gpu.createManyAndReturn({
        data: [
            
        ]
    })

  const player_one = await prisma.basePrebuilt.upsert({
    where: { base_prebuilt_name: 'Player: One' },
    update: {},
    create: {
      base_prebuilt_name: 'Player: One',
      prebuilt_attributes: {
        createMany: {
            data: [{ moba_id: 'Check out Prisma with Next.js',}]
        },
        where: {  }
      },
    },
  })
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