import { describe, expect, test, it, vi } from "vitest";
import { getAllCompatibleFormFactors, getPerformancePrismaObject } from "./db";
import { gamePerformance } from "@/app/api/scrape/types";
import { expectedPerformancePrismaObject } from "@/tests/helpers/utils";

describe("getPerformancePrismaObject", () => {
  it("gets a valid performance object", async () => {
    await expect(
      getPerformancePrismaObject([
        {
          name: "Counter-Strike 2",
          resolutions: [
            { fps: 150, name: "R1080P" },
            { fps: 90, name: "R1440P" },
            { fps: 45, name: "R2160P" },
          ],
        },
        {
          name: "Grand Theft Auto V",
          resolutions: [
            { fps: 65, name: "R1080P" },
            { fps: 40, name: "R1440P" },
            { fps: 0, name: "R2160P" },
          ],
        },
      ])
    ).resolves.toStrictEqual(expectedPerformancePrismaObject);
  });

  it("returns undefined if given an empty array", async () => {
    await expect(getPerformancePrismaObject([])).resolves.toBeUndefined();
  });
});

describe("getAllCompatibleFormFactors", () => {
  test.each([
    ["Mini ITX", ["Mini ITX"]],
    ["Micro ATX", ["Mini ITX", "Micro ATX"]],
    ["ATX", ["Mini ITX", "Micro ATX", "ATX"]],
    ["EATX", ["Mini ITX", "Micro ATX", "ATX", "EATX"]],
  ])('%s is compatile with %s', async (form, expected) => {
    await expect(getAllCompatibleFormFactors(form)).resolves.toStrictEqual(expected);
  });
});
