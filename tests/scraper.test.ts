import { describe, expect, test, beforeAll, beforeEach, afterAll, afterEach } from "vitest";
import {
  cleanPrebuiltScrapeResults,
  getMemoryInfo,
  getPsuInfo,
  getStorageInfo,
  savePrebuiltScrapeResults,
  scrapeAndSavePart,
} from "@/app/api/scrape/utils";
import { Prisma } from "@prisma/client";
import { prismaMock } from "@/app/singleton"

import { extractUsbNumbers } from "@/app/api/scrape/mobachipsets/utils";
import { mobaChipsetCustomSerializer } from "@/app/api/scrape/serializers";
import { nzxtFind } from "@/app/api/scrape/prebuilt/scrapers";

import { scrapeNzxt } from "@/app/api/scrape/prebuilt/scrapers";
import { NzxtCategorySpecMap } from "@/app/api/scrape/prebuilt/types/nzxt";
import { cleanedResults } from "@/app/api/scrape/types";
import prisma from '@/app/db'
import { airCoolerResult, caseFanResult, caseResult, cpuResult, getFile, gpuResult, hddStorageResult, liquidCoolerResult, memoryResult, mobaResult, psuResult, ssdStorageResult } from "./helpers/utils";


const testBrand = "acme"
beforeAll(async () => {
  await prisma.brand.create({data: {name:testBrand}})
});

afterAll(async () => {
  await prisma.brand.deleteMany()
  await prisma.storageType.deleteMany()
});

  describe("prebuilt tracker", async () => {
    test("nzxt and prebuilt tracker", async () => {
      const prebuilt = await nzxtFind(getFile("nzxt-list.html"), testBrand);

      expect(prebuilt).toStrictEqual({
        current: [],
        new: [
          "https://nzxt.com/product/player-pc-5080",
          "https://nzxt.com/product/player-pc-5090",
          "https://nzxt.com/product/player-one",
          "https://nzxt.com/product/player-two",
          "https://nzxt.com/product/player-three",
          "https://nzxt.com/product/player-one-prime",
          "https://nzxt.com/product/player-two-prime",
          "https://nzxt.com/product/player-three-prime",
        ],
        removed: [],
      });
  
      const test = await savePrebuiltScrapeResults(prebuilt, {rawResults: {url: 'test2'}} as unknown as cleanedResults, testBrand);
    });
  
  });


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
