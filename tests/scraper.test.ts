import { describe, expect, test } from "vitest";
import { getMemoryDdr, getMemoryModules, getMemorySpeed, scrapeAndSavePart } from "@/app/api/scrapers/utils";
import { PrismaClient } from "@prisma/client";
import { extractUsbNumbers } from "@/app/api/scrapers/mobachipsets/utils";
import { mobaChipsetCustomSerializer } from "@/app/api/scrapers/serializers";
import path from "path";
import { getFanSize } from "@/app/api/scrapers/nzxt/utils";
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
import { scrapeNzxt } from "@/app/api/scrapers/nzxt/utils";
import { CPUCoolerValues } from "@/app/api/scrapers/nzxt/types";

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

describe("correctly extracts memory modules, speed, and DDR type", () => {
  const memoryModuleTests = [
    { input: "16GB (2 x 8GB) DDR5 5200 MHz", expectedModules: { number: 2, size: 8 }, expectedSpeed: 5200, expectedDDR: "DDR5" },
    { input: "16GB (2 x 8 GB) DDR5 5200 MHz", expectedModules: { number: 2, size: 8 }, expectedSpeed: 5200, expectedDDR: "DDR5" },
    { input: "32GB [16GB x 2] DDR5-5600MHz RGB", expectedModules: { number: 2, size: 16 }, expectedSpeed: 5600, expectedDDR: "DDR5" },
    { input: "32GB [16 GB x 2] DDR5-5600MHz RGB", expectedModules: { number: 2, size: 16 }, expectedSpeed: 5600, expectedDDR: "DDR5" },
    { input: "32GB DDR5-5600MHz RGB RAM", expectedModules: null, expectedSpeed: 5600, expectedDDR: "DDR5" }
  ];

  test.each(memoryModuleTests)("$input", ({ input, expectedModules, expectedSpeed, expectedDDR }) => {
    expect(getMemoryModules(input)).toEqual(expectedModules);
    expect(getMemorySpeed(input)).toBe(expectedSpeed);
    expect(getMemoryDdr(input)).toBe(expectedDDR);
  });
});

describe("prebuilt scraper", async () => {
  test("nzxtFanSizeExtractor", async () => {
    const air = {
      Model: "NZXT T120 RGB",
      "Cooling type": "Air Cooler ",
      Dimensions: "120 x 66 x 159 mm",
      "Coldplate material": "Copper",
      "Heatsink material": "Aluminum",
      "Fan specs": "1 x 120mm RGB Fan",
      RGB: "Yes",
    };
    const liquid = {
      Model: "Kraken 280 RGB",
      "Cooling Type": "AIO Liquid Cooler",
      Dimensions: "143 x 315 x 30mm",
      "Radiator Material": "Aluminum",
      "Block Material": "Copper and Plastic",
      "Fan specs": "2 x F140 RGB Core Fans",
      RGB: "Yes",
    };
    const fan = {
      Model: "F120Q - 120mm Quiet Airflow Fans (Case Version) x1",
      Speed: "500 - 1,200 ± 300 RPM",
      Airflow: "27.77 - 64 CFM",
      "Static Pressure": "0.45 - 1.08 mm - H₂O",
      Noise: "16.7 - 22.5 dBA",
      Dimension: "120 x 180 x 26 mm",
    };
    expect(getFanSize(air)).toBe(120);
    expect(getFanSize(fan)).toBe(120);
    expect(getFanSize(liquid as unknown as CPUCoolerValues)).toBe(280);
  });

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
}, 20000);

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
