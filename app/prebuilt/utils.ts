"use server";
import {
  FormFactor,
  Gpu,
  Case,
    GpuChipset,
  Moba,
  MobaChipset,
  Prisma,
} from "@prisma/client";
import prisma, { getGpuByChipsetOrThrow, getMobaByChipsetOrThrow } from "../db";
import { MobaData, PrebuiltWithParts, includeProduct } from "../lib/types";
import { PartsMap } from "../api/scrape/types";
import { formFactors } from "@/prisma/data";

const take = 5;
const orderBy = {
  price: {
    orderBy: {
      product: {
        min_price: Prisma.SortOrder.asc,
      },
    },
  },
  rating: {
    orderBy: {
      pcpp_rating: Prisma.SortOrder.desc,
    },
  },
};
type OrderBy = keyof typeof orderBy;

export async function getCompatibleCases(
  mobaFormFactor: FormFactor,
  gpu: Gpu,
  order: OrderBy = "price"
) {
  return await prisma.case.findMany({
    where: {
      moba_form_factors: { some: { id: mobaFormFactor.id } },
      maximum_video_card_length_mm: { gte: gpu.length_mm },
      product: { prices: { some: {} } },
    },
    ...includeProduct,
    ...orderBy[order],
    take,
  });
}

export async function getCompatibleMobas(
  //use memory as base since memory performance is more important than moba model
  prebuilt: PrebuiltWithParts,
  order: OrderBy = "price"
) {
  return await prisma.moba.findMany({
    where: {
      moba_form_factor_id: prebuilt.moba_form_factor_id,
      chipset_id: prebuilt.moba_chipset_id,
      memory_speeds: {
        some: {
          speed: {
            equals: prebuilt.memory_speed_mhz,
          },
        },
      },
      memory_max: {
        gte: prebuilt.totalMemoryGb,
      },
      memory_slots: {
        gte: prebuilt.memory_modules,
      },
    },
    ...includeProduct,
    ...orderBy[order],
    take,
  });
}

export async function getCompatibleGpus(
  baseGpu: Gpu,
  order: OrderBy = "price"
) {
  return await prisma.gpu.findMany({
    where: {
      // we will change the case according to chosen gpu so the length_mm is not needed
      // length_mm: {
      //   lte: baseGpu.length_mm,
      // },
      chipset_id: baseGpu.chipset_id,
    },
    ...includeProduct,
    ...orderBy[order],
    take,
  });
}

export async function getCompatibleMemories(
  prebuilt: PrebuiltWithParts,
  order: OrderBy = "price"
) {
  return await prisma.memory.findMany({
    where: {
      memory_speed_mhz: {
        equals: prebuilt.memory_speed_mhz,
      },
      modules: {
        equals: prebuilt.memory_modules,
      },
      module_gb: {
        equals: prebuilt.memory_module_gb,
      },
    },
    ...includeProduct,
    ...orderBy[order],
    take,
  });
}

export async function getCompatiblePsus(
  prebuilt: PrebuiltWithParts,
  baseGpu: Gpu,
  order: OrderBy = "price"
) {
  const formFactors = ["ATX", "EATX"]
  
  return await prisma.psu.findMany({
    where: {
      efficiency_rating: prebuilt.psu_efficiency_rating,
      wattage_w: {
        equals: prebuilt.psu_wattage,
      },
      type: formFactors.includes(prebuilt.moba_form_factor.name) ? "ATX" : "SFX",
    },
    ...includeProduct,
    ...orderBy[order],
    take,
  });
}

export const getDiyParts = async (
  prebuilt: PrebuiltWithParts
): Promise<{
  [K in keyof PartsMap]: [PartsMap[K] | null | undefined, PartsMap[K][]];
}> => {
  const baseGpu =
    prebuilt.parts?.gpu ??
    (await getGpuByChipsetOrThrow(prebuilt.gpu_chipset_id, {
      length_mm: "asc",
    })); //get the smallest gpu for compatibility reasons
  const baseMoba =
    prebuilt.parts?.moba ??
    (await getMobaByChipsetOrThrow(
      prebuilt.moba_chipset_id,
      prebuilt.moba_form_factor_id,
      {
        product: {
          min_price: "asc",
        },
      }
    )); //get the smallest gpu for compatibility reasons

  return {
    case: [
      prebuilt.parts?.case,
      await getCompatibleCases(prebuilt.moba_form_factor, baseGpu),
    ],
    cpu: [prebuilt.cpu, [prebuilt.cpu]],
    moba: [prebuilt.parts?.moba, await getCompatibleMobas(prebuilt)],
    gpu: [prebuilt.parts?.gpu, await getCompatibleGpus(baseGpu)],
    ram: [prebuilt.parts?.memory, await getCompatibleMemories(prebuilt)],
    psu: [prebuilt.parts?.psu, await getCompatiblePsus(prebuilt)],
  };
};
