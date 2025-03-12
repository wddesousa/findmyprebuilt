"use server";

import prisma, { getProductByFullName } from "@/app/db";
import {
  Brand,
  CpuCoolerType,
  ProductType,
  PsuRating,
  Prisma,
} from "@prisma/client";
import {
  prebuiltForeignValues,
  foreignValues,
  PrebuiltSchemaType,
} from "../types";
import { v2 as cloudinary } from "cloudinary";
import { getCpuBrandName } from "@/app/api/scrape/utils";
import slugify from "slugify";
import { formFactorSerializer, formFactorSizes, generateSlug } from "@/app/utils";
import { cleanedResults, gamePerformance, prebuiltParts } from "@/app/api/scrape/types";

export async function getQueuedPrebuilt() {
  return prisma.newProductQueue.findFirst({ where: { is_curated: false } });
}

export async function getForeignValues(): Promise<prebuiltForeignValues> {
  const storageTypes = await getStorageTypes();
  const formFactors = await getFormFactors();
  return {
    os_id: await getOperativeSystems(),
    memory_speed_id: await getMemorySpeeds(),
    moba_chipset_id: await getMobaChipsets(),
    main_storage_type_id: storageTypes,
    secondary_storage_type_id: storageTypes,
    psu_efficiency_rating: await getPsuEfficiencyRatings(),
    moba_form_factor: formFactors,
    case_form_factor: formFactors,
  };
}

// export async function saveNewPrebuilt(data: PrebuiltSchemaType, cleanedResults: cleanedResults) {
//   prisma.prebuilt.create({
//     data: {
//       product: {
//         create: {
//           brand: {connect: {name: data.brand}},
//           name: data.name,
//           type: ProductType.PREBUILT,
//           url: data.url,
//           slug: generateSlug(data.brand, data.name)
//           affiliates: { create: [{
//             store: {name: }    
//           }] 
//         }, 
//         images: {create: {}},
        

//         }},
//       base_price: data.base_price,
//       cpu_cooler_mm: data.cpu_cooler_mm,
//       cpu_cooler_type: data.cpu_cooler_type,
//       customizable: data.customizable,
//       front_fan_mm: data.front_fan_mm,
//       main_storage_gb: data.main_storage_gb,
//       memory_module_gb: data.memory_module_gb,
//       memory_modules: data.memory_modules,
//       psu_efficiency_rating: data.psu_efficiency_rating,
//       psu_wattage: data.psu_wattage,
//       rear_fan_mm: data.rear_fan_mm,
//       warranty_months: data.warranty_months,
//       wireless: data.wireless,
//       secondary_storage_gb: data.secondary_storage_gb,
//       specs_html: cleanedResults.rawResults.specsHtml,
//       moba_chipset: { connect: {id: data.moba_chipset_id}},
//       gpu_chipset: { connect: {id: data.gpu_chipset_id}},
//       main_storage_type: { connect: {id: data.main_storage_type_id}},
//       memory_speed: { connect: {id: data.memory_speed_id}},
//       moba_form_factor: { connect: {name: data.moba_form_factor}},
//       os: { connect: {id: data.os_id}},
//       cpu: { connect: {product_id: data.cpu}},
//       secondary_storage_type: { connect: {id: data.secondary_storage_type_id}},
//       case_form_factors: {
//         connect: (await getAllCompatibleFormFactors(data.case_form_factor)).map(form => ({name: form}))
//       },
//       performance: await getPerformancePrismaObject(cleanedResults.rawResults.performance),
//       parts: {
//         create: {
//           case: {connect: {product_id: data.case}},
//           cooler: {connect: {product_id: data.cpu_cooler}},
//           front_fan: {connect: {product_id: data.front_fan}},
//           rear_fan: {connect: {product_id: data.rear_fan}},
//           gpu_variation: {connect: {product_id: data.gpu}},
//           moba_variation: {connect: {product_id: data.moba}},
//           psu: {connect: {product_id: data.psu}},
//         }
//       },
//   }})
// }

export async function getPerformancePrismaObject(
  performance: gamePerformance
): Promise<Prisma.PerformanceUncheckedCreateNestedManyWithoutPrebuiltInput | Prisma.PerformanceCreateNestedManyWithoutPrebuiltInput | undefined> {
  
  if (performance.length === 0 ) return undefined;

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

export async function getAllCompatibleFormFactors(formFactor: string): Promise<string[]> {
  const compatibleFormFactors = [];
  for (const form in formFactorSizes) {
    compatibleFormFactors.push(formFactorSizes[form].name);
    if (formFactor === formFactorSizes[form].name) 
      return compatibleFormFactors
  }
  return compatibleFormFactors;
}

export async function getOperativeSystems(): Promise<foreignValues[]> {
  return prisma.operativeSystem.findMany();
}

export async function getGpuChipset(name: string) {
  return prisma.gpuChipset.findMany({where: { name: name }});
}

export async function getMemorySpeeds(): Promise<foreignValues[]> {
  return (await prisma.memorySpeed.findMany()).map((mem) => ({
    id: mem.id,
    name: `${mem.ddr} ${mem.speed}`,
  }));
}

export async function getMobaChipsets(): Promise<foreignValues[]> {
  const chipsets = await prisma.mobaChipset.findMany({});
  return JSON.parse(JSON.stringify(chipsets));
}

export async function getStorageTypes(): Promise<foreignValues[]> {
  return prisma.storageType.findMany({});
}

export async function getFormFactors(): Promise<foreignValues[]> {
  const forms = await prisma.formFactor.findMany({});
  return forms && forms.map((form) => ({id: form.name, name: form.name}));
}

export async function getProductsByType(
  type: ProductType
): Promise<foreignValues[]> {
  return prisma.product.findMany({
    where: { type: type },
  });
}

export async function getPsuEfficiencyRatings(): Promise<foreignValues[]> {
  return Object.values(PsuRating).map((rating) => ({
    id: rating,
    name: rating,
  }));
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