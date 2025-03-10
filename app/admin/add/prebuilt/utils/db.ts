"use server";

import prisma from "@/app/db";
import { CpuCoolerType, ProductType, PsuRating } from "@prisma/client";
import { prebuiltForeignValues, foreignValues } from "../types";
import { v2 as cloudinary } from "cloudinary";

export async function getQueuedPrebuilt() {
  return prisma.newProductQueue.findFirst({ where: { is_curated: false } });
}

export async function getForeignValues(): Promise<prebuiltForeignValues> {
  const storageTypes = await getStorageTypes();
  const formFactors = await getFormFactors();
  return {
    os_id: await getOperativeSystems(),
    gpu_chipset_id: await getGpuChipsets(),
    cpu_cooler_type: await getCpuCoolerTypes(),
    memory_speed_id: await getMemorySpeeds(),
    moba_chipset_id: await getMobaChipsets(),
    main_storage_type_id: storageTypes,
    secondary_storage_type_id: storageTypes,
    psu_efficiency_rating: await getPsuEfficiencyRatings(),
    moba_form_factor_id: formFactors,
    case_form_factor: formFactors,
  };
}

export async function getOperativeSystems(): Promise<foreignValues[]> {
  return prisma.operativeSystem.findMany();
}

export async function getGpuChipsets(): Promise<foreignValues[]> {
  return prisma.gpuChipset.findMany();
}

export async function getCpuCoolerTypes(): Promise<foreignValues[]> {
  return [
    {
      name: CpuCoolerType.AIR,
      id: CpuCoolerType.AIR,
    },
    {
      name: CpuCoolerType.LIQUID,
      id: CpuCoolerType.LIQUID,
    },
  ];
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
  return prisma.formFactor.findMany({});
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

export async function formDataToObject(formData: FormData, arrayFields: string[] = []): Promise<Record<string, any>> {
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