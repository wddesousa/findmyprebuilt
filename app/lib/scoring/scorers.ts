import { CpuCoolerType, PsuRating } from "@prisma/client";

import { getAllFormFactors } from "../../db";
import { PrebuiltWithParts } from "../types";
import {
  AnyScore,
  HasFeatureScore,
  MinMaxScore,
  mobaChipsetScoreCoefficients,
  mobaChipsetScores,
  prebuiltScoreCoefficients,
  prebuiltScores,
  ProcessedResults,
  ScoringCoefficient,
} from "./types";
import {
  getContinuousMetricScore,
  getHasFeatureScore,
  getDesirabilityFromOrderScore,
  addMinMaxScore,
  getNegativeMetricScore,
  getTheMoreTheBetterScore,
  getFailedScore,
  getMinScoreFromPart,
  getGpuChipsetScoringValues,
  getMinScoreByPCPart,
  getMobaChipsetScoringValues,
  getPrebuiltScoringValues,
  calculateScore,
} from "./utils";
import { prebuiltBaseCoefficients } from "./coefficients";

export async function getPrebuiltStats() {
  const prebuiltStats = await getPrebuiltScoringValues();
  const gpuChipsetStats = await getGpuChipsetScoringValues();
  const mobaChipsetStats = await getMobaChipsetScoringValues();

  return {
    ...prebuiltStats,
    total_storage: {
      avg:
        prebuiltStats.main_storage_gb.avg! +
        Number(prebuiltStats.main_storage_gb.avg),
      min:
        prebuiltStats.main_storage_gb.min! +
        Number(prebuiltStats.secondary_storage_gb.min),
      max:
        prebuiltStats.main_storage_gb.max! +
        Number(prebuiltStats.secondary_storage_gb.max),
    },
    total_memory: {
      avg:
        prebuiltStats.memory_modules.avg! * prebuiltStats.memory_module_gb.avg!,
      min:
        prebuiltStats.memory_modules.min! * prebuiltStats.memory_module_gb.min!,
      max:
        prebuiltStats.memory_modules.max! * prebuiltStats.memory_module_gb.max!,
    },
    chipsets: {
      gpu: gpuChipsetStats,
      moba: mobaChipsetStats,
    },
    formFactors: (await getAllFormFactors()).map((form) => form.name),
    minPartScores: await getMinScoreByPCPart(),
  };
}

export function getMobaChipsetScores(
  stats: Awaited<ReturnType<typeof getMobaChipsetScoringValues>>,
  chipset: PrebuiltWithParts["moba_chipset"]
) {
  return {
    pciGeneration: getContinuousMetricScore({
      ...stats.pci_generation,
      value: chipset.pci_generation.toNumber(),
    }),
    allowsCpuOc: getHasFeatureScore({
      desired: true,
      value: chipset.cpu_oc,
    }),
    allowsMemoryOc: getHasFeatureScore({
      desired: true,
      value: chipset.memory_oc,
    }),
    guaranteedUsb4thGen: getDesirabilityFromOrderScore({
      fromWorst: [undefined, false, true],
      value: chipset.usb_4_guaranteed,
    }),
    totalPortAllowance: getContinuousMetricScore({
      ...addMinMaxScore([
        {
          ...stats.max_sata_ports,
          value: chipset.max_sata_ports,
        },
        {
          ...stats.max_usb_10_gbps,
          value: chipset.max_usb_10_gbps,
        },
        {
          ...stats.max_usb_20_gbps,
          value: chipset.max_usb_20_gbps,
        },
        { ...stats.max_usb_2_gen, value: chipset.max_usb_2_gen },
        {
          ...stats.max_usb_5_gbps,
          value: chipset.max_usb_5_gbps,
        },
      ]),
    }),
    usb20Allowance: getContinuousMetricScore({
      ...stats.max_usb_20_gbps,
      value: chipset.max_usb_20_gbps,
    }),
    usb10Allowance: getContinuousMetricScore({
      ...stats.max_usb_10_gbps,
      value: chipset.max_usb_10_gbps,
    }),
    usb5Allowance: getContinuousMetricScore({
      ...stats.max_usb_5_gbps,
      value: chipset.max_usb_5_gbps,
    }),
  };
}

const calculateMobaChipsetFinalScore = (
  scores: mobaChipsetScores
) => {
  const total: mobaChipsetScoreCoefficients = {
    pciGeneration: 0.1,
    usb5Allowance: 0.05,
    usb10Allowance: 0.1,
    usb20Allowance: 0.2,
    allowsCpuOc: 0.2,
    allowsMemoryOc: 0.1,
    guaranteedUsb4thGen: 0.2,
    totalPortAllowance: 0.05
  }

  return calculateScore(total, scores)
}

export function getPrebuiltScores(
  d: Awaited<ReturnType<typeof getPrebuiltStats>>,
  prebuilt: PrebuiltWithParts
) {
  //save this json in scores in Prebuilt model and that's it!
  const mobaChipsetScores = getMobaChipsetScores(
    d.chipsets.moba,
    prebuilt.moba_chipset
  );
  const cpuCoolerSize = prebuilt.cpu_aio_cooler_size_mm
    ? {
        min: d.cpu_aio_cooler_size_mm.min,
        max: d.cpu_aio_cooler_size_mm.max,
        avg: d.cpu_aio_cooler_size_mm.avg,
        value: prebuilt.cpu_aio_cooler_size_mm,
      }
    : {
        min: d.cpu_air_cooler_height_mm.min,
        max: d.cpu_air_cooler_height_mm.max,
        avg: d.cpu_air_cooler_height_mm.avg,
        value: prebuilt.cpu_air_cooler_height_mm!,
      };

  return {
    pricing: getNegativeMetricScore({
      ...d.base_price,
      value: prebuilt.base_price.toNumber(),
    }),
    cpuCoolingPower: getContinuousMetricScore(cpuCoolerSize),
    coolingType: getHasFeatureScore<CpuCoolerType>({
      value: prebuilt.cpu_aio_cooler_size_mm ? "AIO" : "AIR",
      desired: "AIO",
    }),
    frontFanPower: getContinuousMetricScore({
      ...d.front_fan_mm,
      value: prebuilt.front_fan_mm,
    }),
    rearFanPower: getContinuousMetricScore({
      ...d.rear_fan_mm,
      value: prebuilt.rear_fan_mm,
    }),
    storageCapacity: getContinuousMetricScore({
      ...d.total_storage,
      value: prebuilt.main_storage_gb! + Number(prebuilt.secondary_storage_gb),
    }),
    totalMemory: getContinuousMetricScore({
      ...d.total_memory,
      value: prebuilt.memory_modules * prebuilt.memory_module_gb,
    }),
    memorySpeed: getContinuousMetricScore({
      ...d.memory_speed_mhz,
      value: prebuilt.memory_speed_mhz,
    }),
    connectivity: getHasFeatureScore<boolean>({
      value: prebuilt.wireless,
      desired: true,
    }),
    formFactorCompatibility: getTheMoreTheBetterScore({
      all: d.formFactors,
      value: prebuilt.case_form_factors.map((form) => form.name),
    }),
    warranty: getContinuousMetricScore({
      ...d.warranty_months,
      value: prebuilt.warranty_months,
    }),
    psuRating: getDesirabilityFromOrderScore<PsuRating>({
      fromWorst: ["NONE", "BRONZE", "SILVER", "GOLD", "PLATINUM", "TITANIUM"],
      value: prebuilt.psu_efficiency_rating,
    }),
    psuPower: getContinuousMetricScore({
      ...d.psu_wattage,
      value: prebuilt.psu_wattage,
    }),
    mainStorageType: getHasFeatureScore<string>({
      value: prebuilt.main_storage_type.name,
      desired: "SSD",
    }),
    secondaryStorageType: prebuilt.secondary_storage_type
      ? getHasFeatureScore<string>({
          value: prebuilt.secondary_storage_type.name,
          desired: "SSD",
        })
      : getFailedScore<HasFeatureScore<string | null>>({
          desired: "SSD",
          value: null,
        }),
    gpu3dMark: getContinuousMetricScore({
      ...d.chipsets.gpu.score_3dmark,
      value: prebuilt.gpu_chipset.score_3dmark,
    }),
    mobaChipsetScores: {
      ...mobaChipsetScores,
      total: calculateMobaChipsetFinalScore(mobaChipsetScores),
    },
    cpuScore: { total: prebuilt.cpu.product.total_score },
    gpuScore: {
      total: prebuilt.parts?.gpu
        ? prebuilt.parts.gpu.product.total_score
        : getMinScoreFromPart(d.minPartScores, "GPU"),
    },
    caseScore: {
      total: prebuilt.parts?.case
        ? prebuilt.parts.case.product.total_score
        : getMinScoreFromPart(d.minPartScores, "CASE"),
    },
    psuScore: {
      total: prebuilt.parts?.psu
        ? prebuilt.parts.psu.product.total_score
        : getMinScoreFromPart(d.minPartScores, "PSU"),
    },
    coolerScore: {
      total: prebuilt.parts?.cooler
        ? prebuilt.parts?.cooler.product.total_score
        : getMinScoreFromPart(d.minPartScores, "COOLER"),
    },
    frontFanScore: {
      total: prebuilt.parts?.front_fan
        ? prebuilt.parts?.front_fan.product.total_score
        : getMinScoreFromPart(d.minPartScores, "CASEFAN"),
    },
    rearFanScore: {
      total: prebuilt.parts?.rear_fan
        ? prebuilt.parts?.rear_fan.product.total_score
        : getMinScoreFromPart(d.minPartScores, "CASEFAN"),
    },
    mobaScore: {
      total: prebuilt.parts?.moba
        ? prebuilt.parts.moba.product.total_score
        : getMinScoreFromPart(d.minPartScores, "MOBA"),
    },
    memoryScore: {
      total: prebuilt.parts?.memory
        ? prebuilt.parts.memory.product.total_score
        : getMinScoreFromPart(d.minPartScores, "MEMORY"),
    },
    storageScore: {
      total: prebuilt.parts?.storage
        ? prebuilt.parts.storage.product.total_score
        : getMinScoreFromPart(d.minPartScores, "STORAGE"),
    },
  };
}

export const calculatePrebuiltFinalScore = (scores: prebuiltScores) => {
  const totalScoreCoefficients = prebuiltBaseCoefficients
  const totalScore = calculateScore(totalScoreCoefficients, scores);

  // const creatorScore =
  // const gamingScore =
};
