import { PrismaClient, Prisma, Product, TypeOfEdit } from "@prisma/client";
import { cleanedResults } from "./api/scrape/types";

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

export async function addProductToQueue(type: TypeOfEdit, url: string, data: cleanedResults) {
  return prisma.newProductQueue.create({
    data: {
      type: type,
      website_url: url,
      scraped_data: JSON.stringify(data),
    },
  })
}

export async function trackProducts(brand: string, urls: string[], date?: Date) {
  return prisma.productTracker.create({
    data: {
      brand: {connect: {name: brand}},
      current_products_slugs: urls.join(";"),
      last_scraped_at: date ?? new Date()
    },
  })
}

// export async function savePrebuilt(specs: Prebuilt) {
//   const brand = await prisma.brand.findUnique({
//     where: { name: brandName },
//     select: { id: true },
//   });
//   if (brand === null) return null;
//   return await prisma.product.create({
//     data: {
//       name: productName,
//       brand_id: brand.id,
//     },
//   });
// }