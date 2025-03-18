import { describe, expect, test, it, vi } from "vitest";
import { prebuiltBaseCoefficients, prebuilt1080pCoefficients, prebuilt1440pCoefficients, prebuilt4kCoefficients, prebuiltBudgetCoefficients, prebuiltVideoEditingCoefficients } from "./coefficients";
import { Prisma } from "@prisma/client";

const sumUpCoefficient = (coefficientObject: Record<string, number>) => 
  Object.values(coefficientObject).reduce((acc, curr) => acc.add(curr), new Prisma.Decimal(0));

describe("prebuiltBaseCoefficients", () => {
  it("total coefficient is exactly 1", () => {
    const total = sumUpCoefficient(prebuiltBaseCoefficients);
    expect(total.toNumber()).toBe(1);
    expect(total.equals(1)).toBe(true);
  });
});

describe("prebuilt1080pCoefficients", () => {
  it("total coefficient is exactly 1", () => {
    const total = sumUpCoefficient(prebuilt1080pCoefficients);
    expect(total.toNumber()).toBe(1);
    expect(total.equals(1)).toBe(true);
  });
});

describe("prebuilt1440pCoefficients", () => {
  it("total coefficient is exactly 1", () => {
    const total = sumUpCoefficient(prebuilt1440pCoefficients);
    expect(total.toNumber()).toBe(1);
    expect(total.equals(1)).toBe(true);
  });
});

describe("prebuilt4kCoefficients", () => {
  it("total coefficient is exactly 1", () => {
    const total = sumUpCoefficient(prebuilt4kCoefficients);
    expect(total.toNumber()).toBe(1);
    expect(total.equals(1)).toBe(true);
  });
});

describe("prebuiltVideoEditingCoefficients", () => {
  it("total coefficient is exactly 1", () => {
    const total = sumUpCoefficient(prebuiltVideoEditingCoefficients);
    expect(total.toNumber()).toBe(1);
    expect(total.equals(1)).toBe(true);
  });
});

describe("prebuiltBudgetCoefficients", () => {
  it("total coefficient is exactly 1", () => {
    const total = sumUpCoefficient(prebuiltBudgetCoefficients);
    expect(total.toNumber()).toBe(1);
    expect(total.equals(1)).toBe(true);
  });
});
