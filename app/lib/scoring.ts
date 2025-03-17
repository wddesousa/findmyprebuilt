import { CpuCoolerType, Prisma, PsuRating, StorageType } from "@prisma/client";

import prisma, { getAllFormFactors } from "../db";
import { PrebuiltWithParts } from "./types";

interface Score<T> {
  value: T;
}

interface MinMaxScore extends Score<number> {
  min: number;
  max: number;
  avg: number;
}

interface HasFeatureScore<T> extends Score<T> {
  desired: T;
}

interface DesirabilityScore<T> extends Score<T> {
  fromWorst: T[];
}

interface TheMoreTheBetterScore extends Score<string[]> {
  all: string[]; //all the possible values
}

type AnyScore<T> =
  | Score<T>
  | MinMaxScore
  | HasFeatureScore<T>
  | DesirabilityScore<T>
  | TheMoreTheBetterScore;

type AggregatedValues = { avg: number; min: number; max: number };

type prismaAggregateValue = number | Prisma.Decimal | null;

type ScoringValues<
  T extends Record<K, Record<P, prismaAggregateValue>>,
  K extends keyof T,
  P extends keyof T[K],
> = {
  [Key in P]: AggregatedValues;
};

const convertDecimal = (value: prismaAggregateValue) =>
  value instanceof Prisma.Decimal ? value.toNumber() : value;

export async function arrangeKeys<
  T extends {
    _avg: Record<P, prismaAggregateValue>;
    _min: Record<P, prismaAggregateValue>;
    _max: Record<P, prismaAggregateValue>;
  },
  P extends keyof T["_avg"],
>(stats: T): Promise<ScoringValues<T, "_avg", P>> {
  const values = Object.fromEntries(
    Object.keys(stats._avg).map((stat) => {
      const key = stat as P;
      const avg = stats._avg[key];
      const min = stats._min[key];
      const max = stats._max[key];

      return [
        key,
        {
          avg: convertDecimal(avg),
          min: convertDecimal(min),
          max: convertDecimal(max),
        },
      ];
    })
  ) as ScoringValues<T, "_avg", P>;

  return values;
}

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
  };
}

export function calculateMobaChipsetScore(
  stats: Awaited<ReturnType<typeof getMobaChipsetScoringValues>>,
  chipset: PrebuiltWithParts["moba_chipset"]
) {
  const scores = {
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
    usb2GenAllowance: getContinuousMetricScore({
      ...stats.max_usb_2_gen,
      value: chipset.max_usb_2_gen,
    }),
  };
}

export async function getPrebuiltScoringValues() {
  const prebuiltFields: Prisma.Args<
    typeof prisma.prebuilt,
    "aggregate"
  >["_avg"] = {
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
    memory_speed_mhz: true,
  };

  return arrangeKeys(
    await prisma.prebuilt.aggregate({
      _min: prebuiltFields,
      _max: prebuiltFields,
      _avg: prebuiltFields,
    })
  );
}

export async function getGpuScoringValues() {
  const fields: Prisma.Args<typeof prisma.gpu, "aggregate">["_avg"] = {
    boost_clock_mhz: true,
    case_expansion_slot_width: true,
    cooling: true,
    core_clock_mhz: true,
    displayport_outputs: true,
    effective_memory_clock_mhz: true,
    hdmi_outputs: true,
    length_mm: true,
    memory_gb: true,
    tdp_w: true,
    total_slot_width: true,
  };

  return arrangeKeys(
    await prisma.gpu.aggregate({
      _min: fields,
      _max: fields,
      _avg: fields,
    })
  );
}

export async function getCpuScoringValues() {
  const fields: Prisma.Args<typeof prisma.cpu, "aggregate">["_avg"] = {
    score_3dmark: true,
  };

  return arrangeKeys(
    await prisma.cpu.aggregate({
      _min: fields,
      _max: fields,
      _avg: fields,
    })
  );
}

export async function getGpuChipsetScoringValues() {
  const fields: Prisma.Args<typeof prisma.gpuChipset, "aggregate">["_avg"] = {
    score_3dmark: true,
  };

  return arrangeKeys(
    await prisma.gpuChipset.aggregate({
      _min: fields,
      _max: fields,
      _avg: fields,
    })
  );
}

export async function getMobaChipsetScoringValues() {
  const fields: Prisma.Args<typeof prisma.mobaChipset, "aggregate">["_avg"] = {
    max_sata_ports: true,
    max_usb_10_gbps: true,
    max_usb_20_gbps: true,
    max_usb_2_gen: true,
    max_usb_5_gbps: true,
    pci_generation: true,
  };

  return arrangeKeys(
    await prisma.mobaChipset.aggregate({
      _min: fields,
      _max: fields,
      _avg: fields,
    })
  );
}

export async function getMemorySpeedOnMobas() {
  return arrangeKeys(
    await prisma.memorySpeedOnMobas.aggregate({
      _max: {
        speed: true,
      },
      _min: {
        speed: true,
      },
      _avg: {
        speed: true,
      },
    })
  );
}

export function calculatePrebuiltScore(
  d: Awaited<ReturnType<typeof getPrebuiltStats>>,
  prebuilt: PrebuiltWithParts
) {
  //save this json in scores in Prebuilt model and that's it!

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

  const scores = {
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
    mobaChipsetScore: calculateMobaChipsetScore(
      d.chipsets.moba,
      prebuilt.moba_chipset
    ),
  };

  return scores;
}

/**
 * more is better
 */
export const getContinuousMetricScore = ({
  min,
  max,
  avg,
  value,
}: MinMaxScore) => ({
  value,
  min,
  max,
  avg,
  total: ((value - min) / (max - min)) * 100,
});

/**
 * less is better
 */
export const getNegativeMetricScore = ({
  min,
  max,
  avg,
  value,
}: MinMaxScore) => ({
  value,
  min,
  max,
  avg,
  total: ((max - value) / (max - min)) * 100,
});

/**
 * if it has a feature, get full points
 */
export const getHasFeatureScore = <T>({
  value,
  desired,
}: HasFeatureScore<T>) => ({
  value,
  desired,
  total: value === desired ? 100 : 0,
});

/**
 * if it has a feature, get full points
 * @param fromWorst An array of value ordered from worst to best
 * @param value The value to test
 * @returns the total score according to its position in the fromWorst array
 */
export const getDesirabilityFromOrderScore = <T>({
  value,
  fromWorst,
}: DesirabilityScore<T>) => {
  const index = fromWorst.indexOf(value);
  if (index < 0) throw Error("Value not found in desired list");

  return {
    value,
    fromWorst,
    total: (fromWorst.indexOf(value) / (fromWorst.length - 1)) * 100,
  };
};

/**
 * the more it has the better
 * @param value an array of the supported values
 * @param all array of all the possible supported values
 * @returns scoring accorindg to how many values of the total desired were found
 */
export const getTheMoreTheBetterScore = ({
  value,
  all,
}: TheMoreTheBetterScore) => ({
  value,
  all,
  total: (value.length / all.length) * 100,
});

export const getFailedScore = <S extends AnyScore<any>>(props: S) => ({
  ...props,
  total: 0,
});

export const addMinMaxScore = (scores: MinMaxScore[]) =>
  scores.reduce(
    (acc, curr) => ({
      min: curr.min + acc.min,
      max: curr.max + acc.max,
      avg: curr.avg + acc.avg,
      value: curr.value + acc.value,
    }),
    { min: 0, max: 0, avg: 0, value: 0 }
  );
