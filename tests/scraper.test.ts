import { describe, expect, test } from "vitest";
import { scrapeAndSavePart } from "@/app/api/scrapers/utils";
import { PrismaClient } from "@prisma/client";
import { extractUsbNumbers } from "@/app/api/scrapers/mobachipsets/utils";
import { mobaChipsetCustomSerializer } from "@/app/api/scrapers/serializers";
import path from "path";
import { pathToFileURL } from "url";
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
} from "./results";
import { scrapeNzxt } from "@/app/api/scrapers/prebuilts/utils";

const prisma = new PrismaClient();
const getFile = (filename: string) =>
  pathToFileURL(path.join(__dirname, "./data", filename)).href;

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


describe("prebuilt scraper", async () => {

  test("prebuilt", async () => {
    // const file = getFile("prebuilt.html");
    const nxzt = await scrapeNzxt("https://nzxt.com/product/player-one");
    expect(nxzt).toMatchObject({
      part_number: ["GL10CS-NR762"],
      product: {
        name: "ROG Strix GL10CS-NR762",
        type: "PREBUILT",
        brand: { name: "Asus" },
      },
    });
  });
}, 20000)

describe("parts specs scraper", async () => {
  
  try {
    await prisma.product.deleteMany({
      where: {
        url: {
          startsWith: "file://",
        },
      },
    });
  } catch (error: any) {
    if (error.code !== "P2025") {
      console.error(error);
      process.exit(error.code);
    }
  }

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
    const part = await scrapeAndSavePart(file);
    expect(part).toMatchObject(expected);
  });
});

