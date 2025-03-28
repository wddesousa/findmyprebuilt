import { Prisma, ProductType } from "@prisma/client";
import {
  AnyScore,
  DesirabilityScore,
  HasFeatureScore,
  MinMaxScore,
  mobaChipsetScoreCoefficients,
  mobaChipsetScores,
  prebuiltScores,
  prismaAggregateValue,
  ProcessedResults,
  ScoringCoefficient,
  ScoringValues,
  TheMoreTheBetterScore,
} from "./types";
import { getPrebuiltScores, getPrebuiltStats } from "./scorers";
import prisma, { getAllPrebuilts } from "@/app/db";
import {
  prebuiltBaseCoefficients,
  prebuilt1080pCoefficients,
  prebuilt1440pCoefficients,
  prebuilt4kCoefficients,
  prebuiltVideoEditingCoefficients,
  prebuiltBudgetCoefficients,
} from "./coefficients";

export const getMinScoreFromPart = (
  minPartScores: Awaited<ReturnType<typeof getPrebuiltStats>>["minPartScores"],
  te: ProductType
) => {
  const part = minPartScores.find((part) => part.type === te);
  return part && part._min.total_score ? part._min.total_score : 0;
};

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

export async function getMinScoreByPCPart() {
  return await prisma.product.groupBy({
    by: ["type"],
    _min: { total_score: true },
  });
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

export const convertDecimal = (value: prismaAggregateValue) =>
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

export function calculateScore(
  scoreCoefficients: ScoringCoefficient<any>,
  scores: ProcessedResults
) {
  const entries = Object.entries(scoreCoefficients);
  const lastIndex = entries.length - 1;

  const results = entries.reduce(
    (acc, [scoreName, coefficient], index) => {
      const totalCoefficient = acc.totalCoefficient.add(
        new Prisma.Decimal(coefficient)
      );
      const key = scoreName as keyof ProcessedResults;
      const totalScore = new Prisma.Decimal(coefficient)
        .times(scores[key].total)
        .add(acc.totalScore);

      if (totalCoefficient.greaterThan(1))
        throw Error(`Coefficient is more than a 1. Total: ${totalCoefficient}`);

      if (index === lastIndex && !totalCoefficient.equals(1)) {
        throw Error(
          `Total coefficient is less than 1. Total: ${totalCoefficient}`
        );
      }

      if (totalScore.greaterThan(100)) {
        throw Error(
          `Total score is more than 100. Total: ${totalScore} on key ${key}`
        );
      }

      return {
        totalScore,
        totalCoefficient,
      };
    },
    {
      totalCoefficient: new Prisma.Decimal(0),
      totalScore: new Prisma.Decimal(0),
    }
  );
  return results.totalScore.toNumber();
}

export const calculatePrebuiltFinalScore = (scores: prebuiltScores) => {
  const totalScore = calculateScore(prebuiltBaseCoefficients, scores);
  const gaming1080 = calculateScore(prebuilt1080pCoefficients, scores);
  const gaming1440 = calculateScore(prebuilt1440pCoefficients, scores);
  const gaming2160 = calculateScore(prebuilt4kCoefficients, scores);
  const creatorScore = calculateScore(prebuiltVideoEditingCoefficients, scores);
  const budgetScore = calculateScore(prebuiltBudgetCoefficients, scores);

  return [
    totalScore,
    gaming1080,
    gaming1440,
    gaming2160,
    creatorScore,
    budgetScore,
  ];
};

export const calculateMobaChipsetFinalScore = (scores: mobaChipsetScores) => {
  const total: mobaChipsetScoreCoefficients = {
    pciGeneration: 0.1,
    usb5Allowance: 0.05,
    usb10Allowance: 0.1,
    usb20Allowance: 0.2,
    allowsCpuOc: 0.2,
    allowsMemoryOc: 0.1,
    guaranteedUsb4thGen: 0.2,
    totalPortAllowance: 0.05,
  };

  return calculateScore(total, scores);
};

export const getRelativeScore = (myScore: number, maxScore: number) =>
  Math.round((myScore / maxScore ) * 100);

export async function updateAllPrebuiltScores() {
  const prebuilts = await getAllPrebuilts();
  const stats = await getPrebuiltStats();
  const generalScores: number[] = [];
  const gaming1080Scores: number[] = [];
  const gaming1440Scores: number[] = [];
  const gaming2160Scores: number[] = [];
  const creatorScores: number[] = [];
  const budgetScoreScores: number[] = [];

  const newScoredPrebuilts = prebuilts.map((prebuilt) => {
    const newScoresWithStats = getPrebuiltScores(stats, prebuilt);
    const [
      totalScore,
      gaming1080,
      gaming1440,
      gaming2160,
      creatorScore,
      budgetScore,
    ] = calculatePrebuiltFinalScore(newScoresWithStats);

    generalScores.push(totalScore);
    gaming1080Scores.push(gaming1080);
    gaming1440Scores.push(gaming1440);
    gaming2160Scores.push(gaming2160);
    creatorScores.push(creatorScore);
    budgetScoreScores.push(budgetScore);

    return {
      product_id: prebuilt.product_id,
      scores: newScoresWithStats,
      totalScore,
      gaming1080,
      gaming1440,
      gaming2160,
      creatorScore,
      budgetScore,
    };
  });

  const maxGeneralScore = Math.max(...generalScores);
  const maxGaming1080Scores = Math.max(...gaming1080Scores);
  const maxGaming1440Scores = Math.max(...gaming1440Scores);
  const maxGaming2160Score = Math.max(...gaming2160Scores);
  const maxcreatorScore = Math.max(...creatorScores);
  const maxbudgetScoreScores = Math.max(...budgetScoreScores);

  await prisma.$transaction(
    newScoredPrebuilts.map((d) => {
      return prisma.prebuilt.update({
        where: { product_id: d.product_id },
        data: {
          gaming_score_1080p: getRelativeScore(
            d.gaming1080,
            maxGaming1080Scores
          ),
          gaming_score_1440p: getRelativeScore(
            d.gaming1440,
            maxGaming1440Scores
          ),
          gaming_score_2160p: getRelativeScore(
            d.gaming2160,
            maxGaming2160Score
          ),
          creator_score: getRelativeScore(d.creatorScore, maxcreatorScore),
          budget_score: getRelativeScore(d.budgetScore, maxbudgetScoreScores),
          product: {
            update: {
              scores: d.scores,
              total_score: getRelativeScore(d.totalScore, maxGeneralScore),
            },
          },
        },
      });
    })
  );
}
