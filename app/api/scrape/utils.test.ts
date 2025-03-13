import { describe, expect, test, it, vi } from "vitest";
import fs from "fs";
import {
  cleanPrebuiltScrapeResults,
  getAmazonAsin,
  getLargestFormFactor,
  getMemoryInfo,
  getPsuInfo,
  getStorageInfo,
  processPartScrapedData,
} from "./utils";
import { prismaMock } from "@/app/singleton";
import { MobaChipset, Prisma, PrismaClient } from "@prisma/client";
import {
  cleanPrebuiltScrapeResultSet,
  formFactorSizeTest,
  getFile,
  memoryModuleTests,
  psuTests,
  scrapeNzxtResults,
  storageTests,
} from "@/tests/helpers/utils";
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
import path from "path";
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

describe("getLargestFormFactor", () => {
  describe("gets largest form factor our of a list and returns undefined if one is not recognized", () => {
    test.each(formFactorSizeTest)("$input", async ({ input, expectedForm }) => {
      expect(getLargestFormFactor(input as any)).toBe(expectedForm);
    });
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

describe("getAmazonAsin", () => {
  it("correctly extracts ASIN", () => {
    expect(getAmazonAsin("https://www.amazon.com/Cooler-Master-Silencio-Anodized-Gun-Metal/dp/B07H25DYM3/ref=pd_ci_mcx_mh_mcx_views_0_image?pd_rd_w=16CM8&content-id=amzn1.sym.bb21fc54-1dd8-448e-92bb-2ddce187f4ac%3Aamzn1.symc.40e6a10e-cbc4-4fa5-81e3-4435ff64d03b&pf_rd_p=bb21fc54-1dd8-448e-92bb-2ddce187f4ac&pf_rd_r=AMTW77GH6CMS65DEDE3W&pd_rd_wg=WAA4Q&pd_rd_r=58f61ee3-8c40-4cb5-a1cc-8f1dd8c923e8&pd_rd_i=B07H25DYM3&th=1")).toBe("B07H25DYM3")
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
    prismaMock.formFactor.findUnique.mockResolvedValue({
      name: "ATX",
      id: "1",
    });

    const cleanedResults = await cleanPrebuiltScrapeResults({
      ...scrapeNzxtResults,
      prebuilt: { ...scrapeNzxtResults.prebuilt, moba_form_factor: "ATX" },
      prebuiltParts: { ...scrapeNzxtResults.prebuiltParts, moba: "a chipset" },
    } as unknown as scraperRawResults);

    expect(cleanedResults.processedResults).toEqual(
      cleanPrebuiltScrapeResultSet
    );
  });
});

describe("processPartScrapedData", async () => {
  test.each([
    ["case_fan", caseFanResult, "caseFan"],
    ["case", caseResult, "case"],
    ["psu", psuResult, "psu"],
    ["cooler", airCoolerResult, "cooler"],
    ["liquid_cooler", liquidCoolerResult, "cooler"],
    ["storage_hdd", hddStorageResult, "storage"],
    ["storage_ssd", ssdStorageResult, "storage"],
    ["cpu", cpuResult, "cpu"],
    ["gpu", gpuResult, "gpu"],
    ["moba", mobaResult, "moba"],
    ["memory", memoryResult, "memory"],
  ])("%s", async (fileName, expected, modelName) => {
    //som shenanigans for typescript
    const model = modelName as keyof PrismaClient;
    const modelDelegate = prismaMock[model] as Prisma.CaseFanDelegate;
    //
    (modelDelegate.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      test: "test",
    });
    const file = path.join(
      __dirname,
      "../../../tests/data",
      `${fileName}.html`
    );
    const html = fs.readFileSync(file, "utf-8");
    await processPartScrapedData(file, html);
    expect(modelDelegate.create).toHaveBeenCalledWith(expected);
  });
});
