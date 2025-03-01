import { cleanedResults } from "@/app/api/scrape/types";
import prisma from "@/app/db";
import { CpuCoolerType, PsuRating } from "@prisma/client";
import { prebuiltForeignValues, foreignValues } from "./types";

export const inputMap: Record<
  keyof cleanedResults["processedResults"],
  "number" | "text" | "boolean" | "dropdown"
> = {
  os_id: "dropdown",
  base_price: "text",
  psu_wattage: "number",
  rear_fan_mm: "number",
  customizable: "boolean",
  front_fan_mm: "number",
  cpu_cooler_mm: "number",
  gpu_chipset_id: "dropdown",
  memory_modules: "number",
  cpu_cooler_type: "dropdown",
  main_storage_gb: "number",
  memory_speed_id: "dropdown",
  moba_chipset_id: "dropdown",
  warranty_months: "number",
  memory_module_gb: "number",
  seconday_storage_gb: "number",
  main_storage_type_id: "dropdown",
  psu_efficiency_rating: "dropdown",
  secondary_storage_type_id: "dropdown",
  wireless: "boolean",
};

export async function getQueuedPrebuilt() {
  return prisma.newProductQueue.findFirst({ where: { is_curated: false } });
}

export async function getForeignValues(): Promise<prebuiltForeignValues> {
  return {
    os_id: await getOperativeSystems(),
    gpu_chipset_id: await getGpuChipsets(),
    cpu_cooler_type: await getCpuCoolerTypes(),
    memory_speed_id: await getMemorySpeeds(),
    moba_chipset_id: await getMobaChipsets(),
    main_storage_type_id: await getMainStorageTypes(),
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
    const chipsets = await prisma.mobaChipset.findMany({})
  return JSON.parse(JSON.stringify(chipsets));
}

export async function getMainStorageTypes(): Promise<foreignValues[]> {
  return prisma.storageType.findMany({});
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
