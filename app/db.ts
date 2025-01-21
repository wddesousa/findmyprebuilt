import { PrismaClient, Prisma, Product } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export async function getProduct(brandName: string, productName: string) {
  const brand = await prisma.brand.findUnique({
    where: { name: brandName },
    select: { id: true },
  });
  if (brand === null) return null;
  return await prisma.product.findUnique({
    where: { name_brand_id: { name: productName, brand_id: brand.id } },
  });
}

