import { PrismaClient, Prisma, Product, TypeOfEdit, Prebuilt } from "@prisma/client";
import { cleanedResults } from "./api/scrape/types";
import { fullProductName, includePrebuiltParts, PrebuiltWithParts } from "./types";
import { prebuiltSchema } from "./admin/add/prebuilt/types";

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


// export async function scorePrebuilt(
//   prebuilt: Prebuilt & Cpu & Moba & Gpu & Case
// ) {}

export async function getPrebuiltScoringValues() {
  return await prisma.prebuilt.aggregate({
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
    }
  });

}

export function getPrebuiltScore(d: Awaited<ReturnType<typeof getPrebuiltScoringValues>>, prebuilt: PrebuiltWithParts
) {
  const [minCoolerValue, maxCoolerValue, coolerValue] = (prebuilt.cpu_aio_cooler_size_mm ? [d._min.cpu_aio_cooler_size_mm, d._max.cpu_aio_cooler_size_mm, prebuilt.cpu_aio_cooler_size_mm]: [d._min.cpu_air_cooler_height_mm, d._max.cpu_air_cooler_height_mm, prebuilt.cpu_air_cooler_height_mm])as number[]

  const prebuiltScores = {
    pricing: getNegativeMetricScore(d._min.base_price!.toNumber(), d._max.base_price!.toNumber(), prebuilt.base_price.toNumber()),
    coolingPower: getContinuousMetricScore(minCoolerValue, maxCoolerValue, coolerValue),
    coolingType: prebuilt.cpu_aio_cooler_size_mm ? 100 : 0,
    frontFanPower: getContinuousMetricScore(d._min.front_fan_mm!, d._max.front_fan_mm!, prebuilt.front_fan_mm),
  }
}

export async function getFullPrebuilt(slug: string): Promise<PrebuiltWithParts> {
  return await prisma.prebuilt.findFirstOrThrow({
    where: {
      product: {
        slug: slug
      }
    },
    ...includePrebuiltParts
  })
}
export async function getAllPrebuilts(): Promise<PrebuiltWithParts[]> {
  return await prisma.prebuilt.findMany(includePrebuiltParts)
}

//more is better
const getContinuousMetricScore = (min: number, max: number, value: number) => ((value - min)/(max-min)) * 100

//less is better
const getNegativeMetricScore = (min: number, max: number, value: number) => ((max - value)/(max-min)) * 100

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
