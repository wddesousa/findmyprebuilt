import { PsuRating } from "@prisma/client";
import { describe, expect, test, it, vi } from "vitest";
import {
  addMinMaxScore,
  calculateScore,
  getContinuousMetricScore,
  getDesirabilityFromOrderScore,
  getHasFeatureScore,
  getNegativeMetricScore,
  getTheMoreTheBetterScore,
} from "./utils";

describe("getDesirabilityFromOrderScore", () => {
  describe("correctly calculates scores", () => {
    const fromWorst = [
      "NONE",
      "BRONZE",
      "SILVER",
      "GOLD",
      "PLATINUM",
      "TITANIUM",
    ];

    test.each([
      { fromWorst, value: "TITANIUM", score: 100 },
      { fromWorst, value: "PLATINUM", score: 80 },
      { fromWorst, value: "BRONZE", score: 20 },
      { fromWorst, value: "NONE", score: 0 },
      { fromWorst: [undefined, false, true], value: true, score: 100 },
      { fromWorst: [undefined, false, true], value: undefined, score: 0 },
      { fromWorst: [undefined, false, true], value: false, score: 50 },
    ])(
      "value: $value, expected score: $score", // Use $ to reference named parameters
      ({ fromWorst, value, score }) => {
        expect(getDesirabilityFromOrderScore({ value, fromWorst }).total).toBe(
          score
        );
      }
    );
  });

  it("throws error if value is not found in the possible values", () => {
    expect(() =>
      getDesirabilityFromOrderScore({
        value: "Unknown",
        fromWorst: ["other", "values"],
      })
    ).toThrow();
  });
});

describe("getTheMoreTheBetterScore", () => {
  describe("correctly calculates scores", () => {
    const all = ["ATX", "EATX", "MICRO", "ITLEL", "ANOTHER"];

    test.each([
      { all, value: ["ATX", "EATX"], score: 40 },
      { all, value: ["ATX", "EATX", "MICRO"], score: 60 },
      { all, value: ["ATX"], score: 20 },
    ])(
      "value: $value, expected score: $score", // Use $ to reference named parameters
      ({ all, value, score }) => {
        expect(getTheMoreTheBetterScore({ value, all }).total).toBe(score);
      }
    );
  });
});

describe("getHasFeatureScore", () => {
  describe("correctly calculates scores", () => {
    const desired = "IWANTTHIS";

    test.each([
      { desired, value: "IHAVETHIS", score: 0 },
      { desired, value: "IWANTTHIS", score: 100 },
    ])(
      "value: $value, expected score: $score", // Use $ to reference named parameters
      ({ desired, value, score }) => {
        expect(getHasFeatureScore({ value, desired }).total).toBe(score);
      }
    );
  });
});

describe("getNegativeMetricScore", () => {
  describe("correctly calculates scores", () => {
    test.each([
      { min: 0, max: 100, avg: 25, value: 50, score: 50 },
      { min: 45, max: 985, avg: 50, value: 45, score: 100 },
      { min: 45, max: 980, avg: 50, value: 980, score: 0 },
    ])(
      "min: $min, max: $max, value: $value expected score: $score", // Use $ to reference named parameters
      ({ min, max, avg, value, score }) => {
        expect(getNegativeMetricScore({ min, max, avg, value }).total).toBe(
          score
        );
      }
    );
  });
});

describe("getContinuousMetricScore", () => {
  describe("correctly calculates scores", () => {
    test.each([
      { min: 0, max: 100, avg: 25, value: 50, score: 50 },
      { min: 45, max: 985, avg: 50, value: 45, score: 0 },
      { min: 45, max: 980, avg: 50, value: 980, score: 100 },
    ])(
      "min: $min, max: $max, value: $value expected score: $score", // Use $ to reference named parameters
      ({ min, max, avg, value, score }) => {
        expect(getContinuousMetricScore({ min, max, avg, value }).total).toBe(
          score
        );
      }
    );
  });
});

describe("addMinMaxScore", () => {
  describe("correctly adds stats", () => {
    test.each([
      {
        scores: [
          { min: 0, max: 100, avg: 50, value: 50 },
          { min: 10, max: 100, avg: 0, value: 50 },
          { min: 10, max: 100, avg: 50, value: 100 },
        ],
        expected: { min: 20, max: 300, avg: 100, value: 200 },
      },
    ])(
      "scores $scores sum up to $expected", // Use $ to reference named parameters
      ({ scores, expected }) => {
        expect(addMinMaxScore(scores)).toStrictEqual(expected);
      }
    );
  });
});

describe("calculateScore", () => {
  it("throws error on total coefficient larger than 1", () => {
    expect(() =>
      calculateScore(
        {
          ascore: 0.9,
          anotherscore: 0.2,
        },
        {
          ascore: { total: 100 },
          anotherscore: { total: 100 },
        }
      )
    ).toThrow(/Coefficient is more than a 1/);
  });
  it("throws error on total coefficient smaller than 1", () => {
    expect(() =>
      calculateScore(
        {
          ascore: 0.8,
          anotherscore: 0.1,
        },
        {
          ascore: { total: 100 },
          anotherscore: { total: 100 },
        }
      )
    ).toThrow(/Total coefficient is less than 1/);
  });
  it("throws error on total score larger than 100", () => {
    expect(() =>
      calculateScore(
        {
          ascore: 0.9,
          anotherscore: 0.1,
        },
        {
          ascore: { total: 105 },
          anotherscore: { total: 100 },
        }
      )
    ).toThrow(/Total score is more than 100/);
  });
  
  it("calculates total score", () => {
    expect(
      calculateScore(
        {
          ascore: 0.9,
          anotherscore: 0.1,
        },
        {
          ascore: { total: 80 },
          anotherscore: { total: 100 },
        }
      )
    ).toBe(82);
  });
});
