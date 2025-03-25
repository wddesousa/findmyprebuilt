import {
  FormFactor,
  Gpu,
  GpuChipset,
  MobaChipset,
  Prisma,
} from "@prisma/client";
import prisma, { getGpuByChipsetOrThrow } from "../db";
import { PrebuiltWithParts, includeProduct } from "../lib/types";
import { PartsMap } from "../api/scrape/types";

const take = 5;
const orderByPrice = (part: ) => {

}

export async function getCompatibleCases(mobaFormFactor: FormFactor, gpu: Gpu) {
  return await prisma.case.findMany({
    where: {
      AND: [
        {
          moba_form_factors: {
            some: {
              id: mobaFormFactor.id,
            },
          },
          maximum_video_card_length_mm: {
            gte: gpu.length_mm,
          },
        },
      ],
    },
    ...includeProduct,
    take,
  });
}

export async function getCompatibleMobas(
  mobaFormFactor: FormFactor,
  mobaChipset: MobaChipset
) {
  return await prisma.moba.findMany({
    where: {
      AND: [
        {
          moba_form_factor_id: mobaFormFactor.id,
          chipset_id: mobaChipset.id,
        },
      ],
    },
    ...includeProduct,
    take,
  });
}

export async function getCompatibleGpus(baseGpu: Gpu) {
  return await prisma.gpu.findMany({
    where: {
      AND: [
        {
          length_mm: {
            lte: baseGpu.length_mm,
          },
          chipset_id: baseGpu.chipset_id,
        },
      ],
    },
    ...includeProduct,
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

  return {
    case: [
      prebuilt.parts?.case,
      await getCompatibleCases(prebuilt.moba_form_factor, baseGpu),
    ],
    cpu: [prebuilt.cpu, [prebuilt.cpu]],
    moba: [
      prebuilt.parts?.moba,
      await getCompatibleMobas(
        prebuilt.moba_form_factor,
        prebuilt.moba_chipset
      ),
    ],
    gpu: [prebuilt.parts?.gpu, await getCompatibleGpus(baseGpu)],
  };
};
