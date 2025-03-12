import { PrismaClient, Prisma, Product, TypeOfEdit } from "@prisma/client";
import { cleanedResults } from "./api/scrape/types";
import { fullProductName } from "./types";

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

export async function addProductToQueue(
  type: TypeOfEdit,
  url: string,
  data: cleanedResults
) {
  return prisma.newProductQueue.create({
    data: {
      type: type,
      website_url: url,
      scraped_data: JSON.stringify(data),
    },
  });
}

export async function trackProducts(
  brand: string,
  urls: string[],
  date?: Date
) {
  return prisma.productTracker.create({
    data: {
      brand: { connect: { name: brand } },
      current_products_slugs: urls,
      last_scraped_at: date ?? new Date(),
    },
  });
}

export async function getProductByFullName(fullName: string) {
  return await prisma.$queryRaw<fullProductName[]>(
    Prisma.sql`
      SELECT p.id, CONCAT(b.name, ' ', p.name) AS full_name, b.name AS brand, p.name AS name
      FROM "Product" p
      JOIN "Brand" b ON p.brand_id = b.id
      WHERE CONCAT(b.name, ' ', p.name) = ${fullName}
      AND type = 'PREBUILT'
      LIMIT 1
    `
  );
}

export async function getAllPrebuilts() {
  return await prisma.prebuilt.findMany({
    include: {
      product: {
        include: {
          brand: true,
        },
      },
      cpu: true,
      parts: {
        include: {
          case: true,
          cooler: true,
          front_fan: true,
          rear_fan: true,
          gpu: true,
          moba: true,
          psu: true,
        },
      },
    },
  });
}

// export async function scorePrebuilt(
//   prebuilt: Prebuilt & Cpu & Moba & Gpu & Case
// ) {}

export async function getPrebuiltScoringValues() {
  const minMax = await prisma.prebuilt.aggregate({
    _max: {
      base_price: true,
      cpu_air_cooler_height_mm: true,
      cpu_aio_cooler_size_mm: true,
      front_fan_mm: true,
      rear_fan_mm: true,
      main_storage_gb: true,
      secondary_storage_gb: true,
      memory_module_gb: true,
      memory_modules: true,
      psu_wattage: true,
      warranty_months: true,
    },
    _min: {
      base_price: true,
      cpu_air_cooler_height_mm: true,
      cpu_aio_cooler_size_mm: true,
      front_fan_mm: true,
      rear_fan_mm: true,
      main_storage_gb: true,
      secondary_storage_gb: true,
      memory_module_gb: true,
      memory_modules: true,
      psu_wattage: true,
      warranty_months: true,
    },
  });

  const topCpus = [

  ]
}

export async function getCpuScoringvalues() {}
// export async function addProductToTracker(brandId: string, url: string) {
//   return prisma.productTracker.update({
//     where: {brand_id: brandId},
//     data: {
//       current_products_slugs: {push: url},
//       last_scraped_at: new Date()
//     },
//   })
// }

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
