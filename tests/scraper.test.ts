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
import { getFile } from "./helpers/utils";


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

test("correctly extracts usb number", () => {
  var string =
    "\n                                                        \n                                                            \n                                                            \n                                                                10 USB 3.2 Ports- Up to 4 USB 3.2 Gen 2x2 (20Gb/s) Ports- Up to 10 USB 3.2 Gen 2x1 (10Gb/s) Ports- Up to 2 USB 3.2 Gen 1x1 (5Gb/s) Ports14 USB 2.0 Ports\n                                                            \n                                                        \n                                                    ";
  expect(extractUsbNumbers(string, "20", "speed")).toEqual(4);
  expect(extractUsbNumbers(string, "10", "speed")).toEqual(10);
  expect(extractUsbNumbers(string, "5", "speed")).toEqual(2);
  expect(extractUsbNumbers(string, "342", "speed")).toEqual(0);

  string =
    "\n                                                        \n                                                            \n                                                            \n                                                                10 USB 3.0 Ports14 USB 2.0 Ports\n                                                            \n                                                        \n                                                    ";
  expect(extractUsbNumbers(string, "3.0", "version")).toEqual(10);
  expect(extractUsbNumbers(string, "2.0", "version")).toEqual(14);
});

test("correcly extract pci generation", () => {
  expect(
    mobaChipsetCustomSerializer["intel"]["pci_generation"]!(
      "\n                                                        \n                                                            \n                                                            \n                                                                3.0, 4.0\n                                                            \n                                                        \n                                                    "
    )
  ).toBe(4);

  expect(
    mobaChipsetCustomSerializer["intel"]["pci_generation"]!(
      "\n                                                        \n                                                            \n                                                            \n                                                                3.0\n                                                            \n                                                        \n                                                    "
    )
  ).toBe(3);
});


