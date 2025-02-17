import { describe, expect, test, it, Vitest, vi } from "vitest";
import {
  cleanPrebuiltScrapeResults,
  getMemoryInfo,
  getPsuInfo,
  getStorageInfo,
  savePrebuiltScrapeResults,
  scrapeAndSavePart,
} from "./utils";
import { prismaMock } from "@/app/singleton";
import { MobaChipset, Prisma, PrismaClient } from "@prisma/client";
import { NzxtCategorySpecMap } from "./prebuilt/nzxt/types";
import {
  air,
  cleanPrebuiltScrapeResultSet,
  fan,
  getFile,
  liquid,
  memoryModuleTests,
  psuTests,
  scrapeNzxtResults,
  storageTests,
} from "@/tests/helpers/utils";
import { scrapeNzxt } from "./prebuilt/nzxt/scraper";
import {
  psuResult,
  airCoolerResult,
  caseFanResult,
  caseResult,
  cpuResult,
  gpuResult,
  hddStorageResult,
  liquidCoolerResult,
  memoryResult,
  mobaResult,
  ssdStorageResult,
} from "@/tests/helpers/utils";
import { scraperRawResults } from "./types";
import { saveCaseFan } from "./db";

describe("getStorageInfo", () => {
  describe("correctly extracts storage info", () => {
    test.each(storageTests)(
      "$input",
      async ({ input, expectedSize, expectedType }) => {
        prismaMock.storageType.findUnique.mockResolvedValue({
          name: expectedType,
          id: "1",
        });

        expect(await getStorageInfo(input)).toMatchObject({
          type: { name: expectedType },
          size: expectedSize,
        });
      }
    );
  });
});

describe("getMemoryInfo", () => {
  describe("correctly extracts memory modules, speed, and DDR type", () => {
    test.each(memoryModuleTests)(
      "$input",
      ({ input, expectedModules, expectedSpeed, expectedDDR }) => {
        expect(getMemoryInfo(input)).toMatchObject({
          ddr: expectedDDR,
          speed: expectedSpeed,
          modules: {
            number: expectedModules.number,
            size: expectedModules?.size,
          },
        });
      }
    );
  });
});

describe("getPsuInfo", () => {
  describe("correctly extracts psu info", () => {
    test.each(psuTests)(
      "$input",
      async ({ input, expectedWattage, expectedRating }) => {
        expect(getPsuInfo(input)).toMatchObject({
          wattage: expectedWattage,
          rating: expectedRating,
        });
      }
    );
  });
});


describe("cleanPrebuiltScrapeResults", async () => {
  it("cleans raw prebuilt results", async () => {
    const mockedIds = { id: "1", name: "test" };
    prismaMock.operativeSystem.findUnique.mockResolvedValue(mockedIds);
    prismaMock.gpuChipset.findUnique.mockResolvedValue(mockedIds);
    prismaMock.mobaChipset.findUnique.mockResolvedValue(
      mockedIds as MobaChipset
    );
    prismaMock.storageType.findUnique.mockResolvedValue({
      name: "SSD",
      id: "1",
    });
    prismaMock.memorySpeed.findUnique.mockResolvedValue({
      id: "1",
      ddr: "DDR5",
      speed: 2,
    });

    const cleanedResults = await cleanPrebuiltScrapeResults({
      ...scrapeNzxtResults,
      prebuiltParts: { ...scrapeNzxtResults.prebuiltParts, moba: "a chipset" },
    } as unknown as scraperRawResults);
    expect(cleanedResults.processedResults).toEqual(
      cleanPrebuiltScrapeResultSet
    );
  });
});

describe("parts specs scraper", async () => {

  test.each([
    ["case_fan", caseFanResult, 'caseFan'],
    ["case", caseResult, saveCaseFan],
    ["psu", psuResult, saveCaseFan],
    ["cooler", airCoolerResult, saveCaseFan],
    ["liquid_cooler", liquidCoolerResult, saveCaseFan],
    ["storage_hdd", hddStorageResult, saveCaseFan],
    ["storage_ssd", ssdStorageResult, saveCaseFan],
    ["cpu", cpuResult, saveCaseFan],
    ["gpu", gpuResult, saveCaseFan],
    ["moba", mobaResult, saveCaseFan],
    ["memory", memoryResult, saveCaseFan],
  ])("%s", async (fileName, expected, modelName) => {
  //som shenanigans for typescript
  const model = modelName as keyof PrismaClient;
  const modelDelegate = prismaMock[model] as Prisma.CaseFanDelegate;
  //
    (modelDelegate.create as ReturnType<typeof vi.fn>).mockResolvedValue({test: 'test'})
    const file = getFile(`${fileName}.html`);
    const part = await scrapeAndSavePart(file) as any;
    // if (fileName === "moba") {
    //   part.memory_speeds = part.memory_speeds.sort((a: any, b: any) => a.speed - b.speed);
    // }
    expect(modelDelegate.create).toHaveBeenCalledWith(expected);
  });

});
