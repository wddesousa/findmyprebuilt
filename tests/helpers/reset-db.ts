// src/tests/helpers/reset-db.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async () => {
  await prisma.$transaction([
    prisma.product.deleteMany(),
    prisma.storageType.deleteMany(),
    prisma.newProductQueue.deleteMany(),
    prisma.productTracker.deleteMany(),
    prisma.mobaChipset.deleteMany(),
    prisma.brand.deleteMany(),
  ])
}
