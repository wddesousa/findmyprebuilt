"use server";

import prisma from "@/app/db";
import { CpuCoolerType, ProductType, PsuRating } from "@prisma/client";
import { prebuiltForeignValues, foreignValues } from "../types";

export async function getQueuedPrebuilt() {
  return prisma.newProductQueue.findFirst({ where: { is_curated: false } });
}

export async function getForeignValues(): Promise<prebuiltForeignValues> {
  const storageTypes = await getStorageTypes();
  return {
    os_id: await getOperativeSystems(),
    gpu_chipset_id: await getGpuChipsets(),
    cpu_cooler_type: await getCpuCoolerTypes(),
    memory_speed_id: await getMemorySpeeds(),
    moba_chipset_id: await getMobaChipsets(),
    main_storage_type_id: storageTypes,
    secondary_storage_type_id: storageTypes,
    psu_efficiency_rating: await getPsuEfficiencyRatings(),
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

export async function getProductsByType(
  type: ProductType
): Promise<foreignValues[]> {
  return prisma.product.findMany({
    where: { type: type },
  });
}

export async function getPsuEfficiencyRatings(): Promise<foreignValues[]> {
  return [
    PsuRating.BRONZE,
    PsuRating.GOLD,
    PsuRating.PLATINUM,
    PsuRating.SILVER,
    PsuRating.TITANIUM,
  ].map((rating) => ({
    id: rating,
    name: rating,
  }));
}
