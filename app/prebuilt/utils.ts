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
import {
  MobaData,
  PrebuiltWithParts,
  includeMobaInfo,
  includeProduct,
} from "../lib/types";
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

const hasPrices = { product: { prices: { some: {} } } };

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
      ...hasPrices,
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
  const mobas = await prisma.moba.findMany({
    where: {
      ...hasPrices,
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

      m_2_slots: prebuilt.main_storage_form_factor.name.includes("M.2")
        ? {
            some: {
              mobaM2Slot: {
                key_type: "M",
              },
            },
          }
        : undefined,
    },
    include: {
      ...includeProduct.include,
      ...includeMobaInfo.include,
    },
    ...orderBy[order],
  });

  if (prebuilt.secondary_storage_form_factor?.name.includes("M.2")) {
    const mobasWithEnoughSlots = mobas.filter((m) => {
      const mSlotCount = m.m_2_slots.filter(
        (slot) => slot.mobaM2Slot.key_type === "M"
      ).length;
      return mSlotCount > 1;
    });
    return mobasWithEnoughSlots.slice(0, take);
  }

  return mobas.slice(0, take);
}

export async function getCompatibleGpus(
  gpuChipset: GpuChipset,
  order: OrderBy = "price"
) {
  return await prisma.gpu.findMany({
    where: {
      ...hasPrices,
      // we will change the case according to chosen gpu so the length_mm is not needed
      // length_mm: {
      //   lte: baseGpu.length_mm,
      // },
      chipset_id: gpuChipset.id,
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
      ...hasPrices,
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

export async function getCompatibleStorages(
  prebuilt: PrebuiltWithParts,
  order: OrderBy = "price"
) {
  return await prisma.storage.findMany({
    where: {
      ...hasPrices,
      capacity_gb: {
        equals: prebuilt.main_storage_gb,
      },
      storage_type: {
        id: prebuilt.main_storage_type.id,
      },
      form_factor: prebuilt.main_storage_form_factor,
    },
    ...includeProduct,
    ...orderBy[order],
    take,
  });
}

export async function getCompatiblePsus(
  prebuilt: PrebuiltWithParts,
  gpu: Gpu,
  order: OrderBy = "price"
) {
  const largeFormFactors = ["ATX", "EATX"];

  const psus = await prisma.psu.findMany({
    where: {
      ...hasPrices,
      efficiency_rating: prebuilt.psu_efficiency_rating,
      wattage_w: {
        equals: prebuilt.psu_wattage,
      },
      type: largeFormFactors.includes(prebuilt.moba_form_factor.name)
        ? "ATX"
        : "SFX",
      pcie_16_pin_connectors: {
        gte: gpu.pci_16,
      },
      pcie_12_pin_connectors: {
        gte: gpu.pci_12,
      },
      pcie_6_pin_connectors: {
        gte: gpu.pci_6,
      },
    },
    ...includeProduct,
    ...orderBy[order],
  });

  if (gpu.pci_8 > 0) {
    const psusWithEnough8Pins = psus.filter(
      (psu) =>
        psu.pcie_8_pin_connectors + psu.pcie_6_2_pin_connectors >= gpu.pci_8
    );
    return psusWithEnough8Pins.slice(0, take);
  }

  return psus.slice(0, take);
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
    gpu: [prebuilt.parts?.gpu, await getCompatibleGpus(prebuilt.gpu_chipset)],
    ram: [prebuilt.parts?.memory, await getCompatibleMemories(prebuilt)],
    psu: [prebuilt.parts?.psu, await getCompatiblePsus(prebuilt, baseGpu)],
    main_storage: [
      prebuilt.parts?.storage,
      await getCompatibleStorages(prebuilt),
    ],
  };
};
