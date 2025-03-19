"use server";

import prisma, {
  getAllFormFactors,
  getAllMobaChipsets,
  getAllOperativeSystems,
  getProductByFullName,
  getPsuEfficiencyRatings,
  getAllStorageTypes,
} from "@/app/db";
import {
  Brand,
  CpuCoolerType,
  ProductType,
  PsuRating,
  Prisma,
} from "@prisma/client";
import { prebuiltForeignValues, PrebuiltSchemaType } from "../types";
import { v2 as cloudinary } from "cloudinary";
import { getAmazonAsin, getCpuBrandName } from "@/app/api/scrape/utils";
import slugify from "slugify";
import {
  formFactorSerializer,
  formFactorSizes,
  generateSlug,
} from "@/app/lib/utils";
import {
  cleanedResults,
  gamePerformance,
  prebuiltParts,
} from "@/app/api/scrape/types";
import { foreignValues } from "@/app/lib/types";

export async function getQueuedPrebuilt() {
  return prisma.newProductQueue.findFirst({ where: { is_curated: false } });
}

export async function getForeignValues(): Promise<prebuiltForeignValues> {
  const setNamesAsId = (values: foreignValues[]): foreignValues[] =>
    values.map((value) => ({ ...value, id: value.name }));

  const storageTypes = await getAllStorageTypes();
  const formFactors = setNamesAsId(await getAllFormFactors());

  return {
    os_id: await getAllOperativeSystems(),
    moba_chipset_id: await getAllMobaChipsets(),
    main_storage_type_id: storageTypes,
    secondary_storage_type_id: storageTypes,
    psu_efficiency_rating: await getPsuEfficiencyRatings(),
    moba_form_factor: formFactors,
    case_form_factor: formFactors,
  };
}

export async function saveNewPrebuilt(
  data: PrebuiltSchemaType,
  cleanedResults: cleanedResults
) {
  if (data.gpu_chipset_score)
    prisma.gpuChipset.update({
      where: { name: data.gpu_chipset },
      data: { score_3dmark: data.gpu_chipset_score },
    });

  if (data.cpu_score)
    prisma.cpu.update({
      where: { product_id: data.cpu },
      data: { score_3dmark: data.cpu_score },
    });

  await prisma.$transaction([
    prisma.prebuilt.create({
      data: {
        product: {
          create: {
            brand: { connect: { name: data.brand } },
            name: data.name,
            type: ProductType.PREBUILT,
            url: data.url,
            scores: ({}),
            slug: generateSlug(data.brand, data.name),
            affiliates: data.amazon ? {
              create: {
                store: {
                  connect: { name: "Amazon" },
                },
                url: data.amazon,
                affiliate_id: getAmazonAsin(data.amazon),
              }
            } : undefined,
            images: {
              create: data.images.map((image, index) => ({
                is_main: index === 0,
                url: image,
              })),
            },
          },
        },
        base_price: data.base_price,
        cpu_air_cooler_height_mm: data.cpu_air_cooler_height_mm,
        cpu_aio_cooler_size_mm: data.cpu_air_cooler_height_mm,
        customizable: data.customizable,
        front_fan_mm: data.front_fan_mm,
        main_storage_gb: data.main_storage_gb,
        memory_module_gb: data.memory_module_gb,
        memory_modules: data.memory_modules,
        psu_efficiency_rating: data.psu_efficiency_rating,
        psu_wattage: data.psu_wattage,
        memory_speed_mhz: data.memory_speed_mhz,
        rear_fan_mm: data.rear_fan_mm,
        warranty_months: data.warranty_months,
        wireless: data.wireless,
        secondary_storage_gb: data.secondary_storage_gb,
        specs_html: cleanedResults.rawResults.specsHtml,
        moba_chipset: { connect: { id: data.moba_chipset_id } },
        gpu_chipset: { connect: { name: data.gpu_chipset } },
        main_storage_type: { connect: { id: data.main_storage_type_id } },
        moba_form_factor: { connect: { name: data.moba_form_factor } },
        os: { connect: { id: data.os_id } },
        cpu: { connect: { product_id: data.cpu } },
        secondary_storage_type: {
          connect: { id: data.secondary_storage_type_id },
        },
        case_form_factors: {
          connect: (
            await getAllCompatibleFormFactors(data.case_form_factor)
          ).map((form) => ({ name: form })),
        },
        performance: await getPerformancePrismaObject(
          cleanedResults.rawResults.performance
        ),
        parts: {
          create: {
            case: { connect: { product_id: data.case } },
            cooler: { connect: { product_id: data.cpu_cooler } },
            front_fan: { connect: { product_id: data.front_fan } },
            rear_fan: { connect: { product_id: data.rear_fan } },
            gpu: { connect: { product_id: data.gpu } },
            moba: { connect: { product_id: data.moba } },
            psu: { connect: { product_id: data.psu } },
            storage: { connect: { product_id: data.main_storage } },
            secondary_storage: { connect: { product_id: data.second_storage } },
            memory: { connect: { product_id: data.ram } },
          },
        },
      },
    }),
    prisma.newProductQueue.update({
      where: { website_url: data.url },
      data: { is_curated: true },
    }),
  ]);

  //make sure to create new prebuilt first and then call all prebuilts so we get the truth for scoring and getting the true max min values that would include the new build
}

export async function getPerformancePrismaObject(
  performance: gamePerformance
): Promise<
  | Prisma.PerformanceUncheckedCreateNestedManyWithoutPrebuiltInput
  | Prisma.PerformanceCreateNestedManyWithoutPrebuiltInput
  | undefined
> {
  if (performance.length === 0) return undefined;

  return {
    create: performance.flatMap((game) =>
      game.resolutions.map((resolution) => ({
        game: {
          connectOrCreate: {
            create: { name: game.name },
            where: { name: game.name },
          },
        },
        resolution: resolution.name,
        fps: resolution.fps,
      }))
    ),
  };
}

export async function getAllCompatibleFormFactors(
  formFactor: string
): Promise<string[]> {
  const compatibleFormFactors = [];
  for (const form in formFactorSizes) {
    compatibleFormFactors.push(formFactorSizes[form].name);
    if (formFactor === formFactorSizes[form].name) return compatibleFormFactors;
  }
  return compatibleFormFactors;
}

export async function formDataToObject(
  formData: FormData,
  arrayFields: string[] = []
): Promise<Record<string, any>> {
  const result: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
    if (arrayFields.includes(key)) {
      // Always treat these fields as arrays
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(value);
    } else {
      // Handle other fields as usual
      result[key] = value;
    }
  }

  return result;
}

export async function uploadImageToCloud(image: string, slug: string) {
  return await cloudinary.uploader.upload(image, {
    public_id_prefix: slug,
  });
}
