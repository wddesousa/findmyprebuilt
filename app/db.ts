import {
  PrismaClient,
  Prisma,
  Product,
  TypeOfEdit,
  Prebuilt,
  ProductType,
  PsuRating,
  CpuCoolerType,
} from "@prisma/client";
import { cleanedResults } from "./api/scrape/types";
import {
  foreignValues,
  fullProductName,
  includeMobaInfo,
  includePrebuiltParts,
  includeProduct,
  PrebuiltWithParts,
} from "./lib/types";
import { M } from "vitest/dist/chunks/environment.LoooBwUu.js";
import { format } from "./lib/utils";

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    name: "combiningPrebuiltValues",
    result: {
      prebuilt: {
        totalMemoryGb: {
          needs: { memory_modules: true, memory_module_gb: true },
          compute(prebuilt) {
            return prebuilt.memory_modules * prebuilt.memory_module_gb;
          },
        },
        totalStorageGb: {
          needs: { main_storage_gb: true, secondary_storage_gb: true },
          compute(prebuilt) {
            return (
              prebuilt.main_storage_gb + Number(prebuilt.secondary_storage_gb)
            );
          },
        },
        psuInfo: {
          needs: { psu_efficiency_rating: true, psu_wattage: true },
          compute(prebuilt) {
            return `${prebuilt.psu_wattage} W ${format.rating(prebuilt.psu_efficiency_rating)}`;
          },
        },
        fullMemoryInfo: {
          needs: {
            memory_modules: true,
            memory_module_gb: true,
            memory_speed_mhz: true,
          },
          compute(prebuilt) {
            return `${prebuilt.memory_modules} x ${prebuilt.memory_module_gb} GB ${format.memorySpeed(prebuilt.memory_speed_mhz)}`;
          },
        },
        coolingType: {
          needs: { cpu_aio_cooler_size_mm: true },
          compute(prebuilt) {
            return prebuilt.cpu_aio_cooler_size_mm > 0 ? `AIO` : "Air";
          },
        },
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

//--------------------------------------------------------------------------//

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
      LIMIT 1
    `
  );
}

export async function getFullPrebuilt(
  slug: string
): Promise<PrebuiltWithParts | null> {
  return await prisma.prebuilt.findFirst({
    where: {
      product: {
        slug: slug,
      },
    },
    ...includePrebuiltParts,
  });
}

export async function getGpuByChipsetOrThrow(
  chipsetId: string,
  orderBy: Prisma.Args<
    typeof prisma.gpu,
    "findFirstOrThrow"
  >["orderBy"] = undefined
) {
  return await prisma.gpu.findFirstOrThrow({
    where: { chipset_id: chipsetId },
    ...includeProduct,
    orderBy: orderBy,
  });
}

export async function getMobaByChipsetOrThrow(
  chipsetId: string,
  mobaFormFactorId: string,
  orderBy: Prisma.Args<
    typeof prisma.moba,
    "findFirstOrThrow"
  >["orderBy"] = undefined
) {
  return await prisma.moba.findFirstOrThrow({
    where: {
      chipset_id: chipsetId,
      moba_form_factor_id: mobaFormFactorId,
    },
    include: {
      product: includeProduct.include.product,
      ...includeMobaInfo
    },
    orderBy: orderBy,
  });
}

export async function getAllPrebuiltScores() {
  return await prisma.prebuilt.findMany({
    select: {
      product_id: true,
      budget_score: true,
      gaming_score_1080p: true,
      gaming_score_1440p: true,
      gaming_score_2160p: true,
      creator_score: true,
      product: {
        select: {
          scores: true,
          total_score: true,
        },
      },
    },
  });
}

export async function getAllPrebuilts(): Promise<PrebuiltWithParts[]> {
  return await prisma.prebuilt.findMany(includePrebuiltParts);
}

export async function getAllProductsByType(type: ProductType) {
  return await prisma.product.findMany({
    where: { type: type },
  });
}

export async function getAllOperativeSystems(): Promise<foreignValues[]> {
  return prisma.operativeSystem.findMany();
}

export async function getAllGpuChipsets(name: string) {
  return prisma.gpuChipset.findMany({ where: { name: name } });
}

export async function getAllMobaChipsets(): Promise<foreignValues[]> {
  const chipsets = await prisma.mobaChipset.findMany({});
  return JSON.parse(JSON.stringify(chipsets));
}

export async function getAllStorageTypes(): Promise<foreignValues[]> {
  return prisma.storageType.findMany({});
}

export async function getAllFormFactors(): Promise<foreignValues[]> {
  return await prisma.formFactor.findMany({});
}

export async function getAllStorageFormFactors(): Promise<foreignValues[]> {
  return await prisma.storageFormFactor.findMany({});
}

export async function getPsuEfficiencyRatings(): Promise<foreignValues[]> {
  return Object.values(PsuRating).map((rating) => ({
    id: rating,
    name: rating,
  }));
}

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
