import {
  PrismaClient,
  Prisma,
  Product,
  TypeOfEdit,
  Prebuilt,
} from "@prisma/client";
import { cleanedResults } from "./api/scrape/types";
import {
  fullProductName,
  includePrebuiltParts,
  PrebuiltWithParts,
} from "./types";
import { prebuiltSchema } from "./admin/add/prebuilt/types";
import { memo } from "react";

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    name: "totalMemoryStorage",
    result: {
      prebuilt: {
        total_memory_gb: {
          needs: { memory_modules: true, memory_module_gb: true },
          compute(prebuilt) {
            return prebuilt.memory_modules * prebuilt.memory_module_gb;
          },
        },
        total_storage_gb: {
          needs: { main_storage_gb: true, secondary_storage_gb: true },
          compute(prebuilt) {
            return (
              prebuilt.main_storage_gb + Number(prebuilt.secondary_storage_gb)
            );
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
      AND type = 'PREBUILT'
      LIMIT 1
    `
  );
}

// export async function scorePrebuilt(
//   prebuilt: Prebuilt & Cpu & Moba & Gpu & Case
// ) {}

export async function getPrebuiltScoringValues() {
  const prebuiltFields: Prisma.Args<typeof prisma.prebuilt, 'aggregate'>["_avg"] = {
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
    memory_speed_mhz: true
  }

  const prebuiltStats = await prisma.prebuilt.aggregate({
    _min: prebuiltFields,
    _max: prebuiltFields,
    _avg: prebuiltFields,
  });

  const cpuFields: Prisma.Args<typeof prisma.cpu, 'aggregate'>["_avg"] = {
    core_count: true,
    l2_cache_mb: true,
    //...
  }

  const cpuStats = await prisma.cpu.aggregate({
    _min: cpuFields,
    _max: cpuFields,
    _avg: cpuFields,
  });

  // const memorySpeedOnMobas = await prisma.memorySpeedOnMobas.aggregate({
  //   _max: {
  //     speed: true,
  //   },
  //   _min: {
  //     speed: true,
  //   },
  //   _avg: {
  //     speed: true,
  //   },
  // });

  return {
    avg: {
      ...prebuiltStats._avg,
      total_storage: prebuiltStats._avg.main_storage_gb! + Number(prebuiltStats._avg.secondary_storage_gb),
      total_memory:  prebuiltStats._avg.memory_modules! * prebuiltStats._avg.memory_module_gb!
    },
    max: {
      ...prebuiltStats._max,
      total_storage: prebuiltStats._max.main_storage_gb! + Number(prebuiltStats._max.secondary_storage_gb),
      total_memory:  prebuiltStats._max.memory_modules! * prebuiltStats._max.memory_module_gb!
    },
    min: {
      ...prebuiltStats._min,
      total_storage: prebuiltStats._min.main_storage_gb! + Number(prebuiltStats._min.secondary_storage_gb),
      total_memory:  prebuiltStats._min.memory_modules! * prebuiltStats._min.memory_module_gb!
    },
  };
}

interface Score {
  value: number;
};

interface MinMaxScore extends Score {
  min: number;
  max: number;
  avg: number;
}

interface HasFeatureScore extends Score {
  value: any;
  desired: string;
}

interface TheMoreTheBetterScore extends Score {
  allDesired: string[]
}

export function calculatePrebuiltScore(
  d: Awaited<ReturnType<typeof getPrebuiltScoringValues>>,
  prebuilt: PrebuiltWithParts
) {
  //save this json in scores in Prebuilt model and that's it!

  const [minCoolerValue, maxCoolerValue, avgCoolerValue, coolerValue] = (
    prebuilt.cpu_aio_cooler_size_mm
      ? [
          d.min.cpu_aio_cooler_size_mm,
          d.max.cpu_aio_cooler_size_mm,
          d.avg.cpu_aio_cooler_size_mm,
          prebuilt.cpu_aio_cooler_size_mm,
        ]
      : [
          d.min.cpu_air_cooler_height_mm,
          d.max.cpu_air_cooler_height_mm,
          d.avg.cpu_air_cooler_height_mm,
          prebuilt.cpu_air_cooler_height_mm,
        ]
  ) as number[];

  const scores = {
    pricing: getNegativeMetricScore({
      min: d.min.base_price!.toNumber(),
      max: d.max.base_price!.toNumber(),
      avg: d.avg.base_price!.toNumber(),
      value: prebuilt.base_price.toNumber()}
    ),
    cpuCoolingPower: getContinuousMetricScore({
      min: minCoolerValue, 
      max: maxCoolerValue,
      avg: avgCoolerValue,
      value: coolerValue
    }),
    coolingType: getHasFeatureScore({
      value: prebuilt.cpu_aio_cooler_size_mm ? 'AIO' : 'Air',
      desired: 'AIO'
    }),
    frontFanPower: getContinuousMetricScore({
      min: d.min.front_fan_mm!,
      max: d.max.front_fan_mm!,
      avg: d.avg.front_fan_mm!,
      value: prebuilt.front_fan_mm
    }
    ),
    rearFanPower: getContinuousMetricScore({
      min: d.min.rear_fan_mm!,
      max: d.max.rear_fan_mm!,
      avg: d.avg.rear_fan_mm!,
      value: prebuilt.rear_fan_mm}
    ),
    storageCapacity: getContinuousMetricScore({
      min: d.min.total_storage,
      max: d.max.total_storage,
      avg: d.avg.total_storage,
      value: prebuilt.main_storage_gb! + Number(prebuilt.secondary_storage_gb),
    }),
    totalMemory: getContinuousMetricScore({
      min: d.min.total_memory,
      max: d.max.total_memory,
      avg: d.avg.total_memory,
      value: prebuilt.memory_modules * prebuilt.memory_module_gb
    }),
    memorySpeed: getContinuousMetricScore({
      min: d.min.memory_speed_mhz!,
      max: d.max.memory_speed_mhz!,
      avg: d.avg.memory_speed_mhz!,
      value: prebuilt.memory_speed_mhz,
    }),
    connectivity: {
      //wifi
    },
    mobaChipset: {

    },
    caseFormFactor: {

    },
    warranty: {

    },
    psuRating: {

    },
    psuPower: {

    },
    gpuChipset: {

    },
    cpu: {

    },
    mainStorageType: {

    },
    secondaryStorageType: {

    },
    parts: {
      gpu: prebuilt.parts?.gpu ? {total: getMinScoreFromDb} : calculateGpuScore(),
      case: prebuilt.parts?.case ? {total: getMinScoreFromDb} : calculateCaseScore(),
    }
  };

  return scores

}

export async function getFullPrebuilt(
  slug: string
): Promise<PrebuiltWithParts> {
  return await prisma.prebuilt.findFirstOrThrow({
    where: {
      product: {
        slug: slug,
      },
    },
    ...includePrebuiltParts,
  });
}
export async function getAllPrebuilts(): Promise<PrebuiltWithParts[]> {
  return await prisma.prebuilt.findMany(includePrebuiltParts);
}

//more is better
const getContinuousMetricScore = ({min, max, avg, value}: MinMaxScore) =>
  ({
    value,
    min,
    max,
    avg,
    total: ((value - min) / (max - min)) * 100
  });

//less is better
const getNegativeMetricScore = ({min, max, avg, value}: MinMaxScore) =>({
  value,
  min,
  max,
  avg,
  total: ((max - value) / (max - min)) * 100
})

//if it has a feature, get full points
const getHasFeatureScore = ({value, desired}: HasFeatureScore) => ({
  value,
  desired,
  total: value === desired ? 100 : 0
});

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
