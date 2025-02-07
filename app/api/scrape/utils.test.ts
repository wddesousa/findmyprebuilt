import { describe, expect, test } from "vitest";
import {
    cleanPrebuiltScrapeResults,
    getMemoryInfo,
    getPsuInfo,
    getStorageInfo,
    getFanSize,
    savePrebuiltScrapeResults,
    scrapeAndSavePart,
  } from "./utils";
import { prismaMock } from "@/app/singleton"
import { MobaChipset, Prisma } from "@prisma/client";
import { NzxtCategorySpecMap } from "./prebuilt/types/nzxt";
import { air, cleanPrebuiltScrapeResultSet, fan, getFile, liquid, memoryModuleTests, psuTests, scrapeNzxtResults, storageTests } from "@/tests/helpers/utils";
import { scrapeNzxt } from "./prebuilt/scrapers";
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
  
describe("correctly extracts storage info", () => {  
    test.each(storageTests)(
      "$input",
      async ({ input, expectedSize, expectedType }) => {
        prismaMock.storageType.findUnique.mockResolvedValue({ name: expectedType, id: "1" });

        expect(await getStorageInfo(input)).toMatchObject({
          type: { name: expectedType },
          size: expectedSize,
        });
      }
    );
  });
  
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
  
  describe("prebuilt scraper", async () => {
    test("nzxtFanSizeExtractor", async () => {
      expect(getFanSize(air)).toBe("120");
      expect(getFanSize(fan)).toBe("120");
      expect(
        getFanSize(liquid as unknown as NzxtCategorySpecMap["CPU Cooler"])
      ).toBe("280");
    });
  
    test("prebuilt", async () => {
      const file = getFile("nzxt.html");
      const nzxt = await scrapeNzxt(file);
      //TODO: moba should be mobachipset or moba. Check first for moba model then use the chipset, throw error if none
      expect(nzxt).toMatchObject(scrapeNzxtResults);
      nzxt.prebuiltParts.moba = "a chipset"

      const mockedIds = {id:"1",name: "test" }
      prismaMock.operativeSystem.findUnique.mockResolvedValue(mockedIds)
      prismaMock.gpuChipset.findUnique.mockResolvedValue(mockedIds)
      prismaMock.mobaChipset.findUnique.mockResolvedValue(mockedIds as MobaChipset)
      prismaMock.storageType.findUnique.mockResolvedValue({ name: "SSD", id: "1" });
      prismaMock.memorySpeed.findUnique.mockResolvedValue({ id: "1", ddr: "DDR5", speed: 2  });

      const cleanedResults = await cleanPrebuiltScrapeResults(nzxt);
      expect(cleanedResults.processedResults).toEqual(cleanPrebuiltScrapeResultSet)
    });
  }, 20000);
  
  describe("parts specs scraper", async () => {

    test.each([
      ["case_fan", caseFanResult],
      ["case", caseResult],
      ["psu", psuResult],
      ["cooler", airCoolerResult],
      ["liquid_cooler", liquidCoolerResult],
      ["storage_hdd", hddStorageResult],
      ["storage_ssd", ssdStorageResult],
      ["cpu", cpuResult],
      ["gpu", gpuResult],
      ["moba", mobaResult],
      ["memory", memoryResult],
    ])("%s", async (fileName, expected) => {
      const file = getFile(`${fileName}.html`);
      const part = await scrapeAndSavePart(file) as any;
      if (fileName === "moba") {
        part.memory_speeds = part.memory_speeds.sort((a: any, b: any) => a.speed - b.speed);
      }
      expect(part).toMatchObject(expected);
    });
  
  });
  