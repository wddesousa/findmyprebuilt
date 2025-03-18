import { Prisma } from "@prisma/client";
import { getMobaChipsetScores, getPrebuiltScores } from "./scorers";

export interface Score<T> {
  value: T;
}

export interface MinMaxScore extends Score<number> {
  min: number;
  max: number;
  avg: number;
}

export interface HasFeatureScore<T> extends Score<T> {
  desired: T;
}

export interface DesirabilityScore<T> extends Score<T> {
  fromWorst: T[];
}

export interface TheMoreTheBetterScore extends Score<string[]> {
  all: string[]; //all the possible values
}

export type AnyScore<T> =
  | Score<T>
  | MinMaxScore
  | HasFeatureScore<T>
  | DesirabilityScore<T>
  | TheMoreTheBetterScore;

export type ProcessedResults = Record<
  string,
  {total: number}
>;

export type AggregatedValues = { avg: number; min: number; max: number };

export type prismaAggregateValue = number | Prisma.Decimal | null;

export type ScoringValues<
  T extends Record<K, Record<P, prismaAggregateValue>>,
  K extends keyof T,
  P extends keyof T[K],
> = {
  [Key in P]: AggregatedValues;
};

export type prebuiltScores = ReturnType<typeof getPrebuiltScores>;
export type mobaChipsetScores = ReturnType<typeof getMobaChipsetScores>;

export type ScoringCoefficient<T> = {
  [Key in keyof T]: number;
};

export type prebuiltScoreCoefficients = ScoringCoefficient<prebuiltScores>;
export type mobaChipsetScoreCoefficients =
  ScoringCoefficient<mobaChipsetScores>;
