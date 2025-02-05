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
import prisma from "@/app/db"
import { extractUsbNumbers } from "@/app/api/scrape/mobachipsets/utils";
import { mobaChipsetCustomSerializer } from "@/app/api/scrape/serializers";
import path from "path";
import { getFanSize, nzxtFind } from "@/app/api/scrape/prebuilt/scrapers";
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
import { scrapeNzxt } from "@/app/api/scrape/prebuilt/scrapers";
import { NzxtCategorySpecMap } from "@/app/api/scrape/prebuilt/types/nzxt";
import { cleanedResults } from "@/app/api/scrape/types";

const getFile = (filename: string) =>
  pathToFileURL(path.join(__dirname, "./data", filename)).href;
const testBrand = "acme"

beforeAll(async () => {
    await prisma.brand.create({data: {name:testBrand}})
  });

  afterAll(async () => {
    await prisma.brand.deleteMany()
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

describe("correctly extracts psu info", () => {
  const psuTests = [
    {
      input: "650W Gold 80+ Gold 650 W",
      expectedWattage: 650,
      expectedRating: "GOLD",
    },
    {
      input: "750 Watt - High Power - 80 PLUS Gold Certified",
      expectedWattage: 750,
      expectedRating: "GOLD",
    },
    {
      input: "750 Watt - High Power - 80 PLUS titanium Certified",
      expectedWattage: 750,
      expectedRating: "TITANIUM",
    },
    {
      input: "750 Watt - High Power - 80 PLUS Bronze Certified",
      expectedWattage: 750,
      expectedRating: "BRONZE",
    },
    {
      input: "750 Watt - High Power - 80 PLUS Platinum Certified",
      expectedWattage: 750,
      expectedRating: "PLATINUM",
    },
    {
      input: "750 Watt - High Power - 80 PLUS SILVER Certified",
      expectedWattage: 750,
      expectedRating: "SILVER",
    },
    {
      input: "750 Watt - High Power - 80 PLUS Gold Certified",
      expectedWattage: 750,
      expectedRating: "GOLD",
    },
    {
      input: "MSI MAG A750GL PCIe 5",
      expectedWattage: null,
      expectedRating: null
    },
  ];
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

describe("correctly extracts storage info", () => {
  const storageTests = [
    { input: "1TB NVMe M.2 SSD", expectedSize: 1024, expectedType: "SSD" },
    { input: "2 tb NVMe M.2 SSD", expectedSize: 2048, expectedType: "SSD" },
    {
      input: "1TB NVMe M.2 SSD + 1TB NVMe M.2 SSD",
      expectedSize: 1024,
      expectedType: "SSD",
    },
    { input: "800GB NVMe M.2 SSD", expectedSize: 800, expectedType: "SSD" },
    {
      input:
        "Seagate Barracuda Compute 900 gB 3.5 7200 RPM Internal Hard Drive",
      expectedSize: 900,
      expectedType: "7200 RPM",
    },
  ];

  test.each(storageTests)(
    "$input",
    async ({ input, expectedSize, expectedType }) => {
      expect(await getStorageInfo(input)).toMatchObject({
        type: { name: expectedType },
        size: expectedSize,
      });
    }
  );
});

describe("correctly extracts memory modules, speed, and DDR type", () => {
  const memoryModuleTests = [
    {
      input: "16GB (2 x 8GB) DDR5 5200 MHz",
      expectedModules: { number: 2, size: 8 },
      expectedSpeed: 5200,
      expectedDDR: "DDR5",
    },
    {
      input: "16GB (2 x 8 GB) DDR5 5200 MHz",
      expectedModules: { number: 2, size: 8 },
      expectedSpeed: 5200,
      expectedDDR: "DDR5",
    },
    {
      input: "32GB [16GB x 2] DDR5-5600MHz RGB",
      expectedModules: { number: 2, size: 16 },
      expectedSpeed: 5600,
      expectedDDR: "DDR5",
    },
    {
      input: "32GB [16 GB x 2] DDR5-5600MHz RGB",
      expectedModules: { number: 2, size: 16 },
      expectedSpeed: 5600,
      expectedDDR: "DDR5",
    },
    {
      input: "32GB DDR5-5600MHz RGB RAM",
      expectedModules: { number: null, size: null },
      expectedSpeed: 5600,
      expectedDDR: "DDR5",
    },
  ];

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
    expect(nzxt).toMatchObject({
      prebuilt: {
        customizable: true,
        base_price: "829",
        front_fan_mm: "120",
        rear_fan_mm: "120",
        cpu_cooler_mm: "120",
        cpu_cooler_type: "Air Cooler",
        os: "Windows 11 Home",
        warranty_months: "24",
        wireless: undefined,
      },
      prebuiltParts: {
        psu: "650W Gold 80+ Gold 650 W",
        cpu: "Intel® Core™ i5-13400F",
        case: "NZXT H5 Flow",
        cpu_cooler: "NZXT T120",
        gpu: "NVIDIA® GeForce RTX™ 3050",
        front_fan: "F120Q - 120mm Quiet Airflow Fans (Case Version) x1",
        rear_fan: "F120P Static Pressure Fan x1",
        main_storage: "1TB NVMe M.2 SSD",
        second_storage: undefined,
        moba: undefined,
        ram: "16GB (2 x 8GB) DDR5 5200 MHz (max speed)",
      },
      specsHtml: `[{"specCategory":"Key Specs","specValues":{"Operating System":"Windows 11 Home","CPU":"Intel® Core™ i5-13400F","GPU":"NVIDIA® GeForce RTX™ 3050","RAM":"16GB (2 x 8GB) DDR5 5200 MHz (max speed)","Storage":"1TB NVMe M.2 SSD"}},{"specCategory":"Software","specValues":{"Operating System":"Windows 11 Home","PC Monitoring & Customization":"CAM","Xbox Gamepass":"30 Day Free Trial"}},{"specCategory":"Processor","specValues":{"Base AMD Processor":"AMD Ryzen™ 5 8400F","Base Intel Processor":"Intel® Core™ i5-13400F"}},{"specCategory":"Graphics","specValues":{"Chipset Manufacturer":"NVIDIA® ","Base Graphics Model":"GeForce RTX™ 3050","Upgrade Graphics Model":"GeForce RTX™ 4060"}},{"specCategory":"Memory","specValues":{"Base System Memory":"16 GB (2 × 8GB) DDR5 5200 MHz","Upgrade System Memory":"32GB (4 × 8GB) DDR5 5200 MHz","RGB":"No"}},{"specCategory":"Storage","specValues":{"Model":"Product brand may vary","Base Storage":"1TB NVMe M.2 SSD","Upgrade Storage":"2TB NVMe M.2 SSD"}},{"specCategory":"Motherboard (AMD CPU)","specValues":{"Model":"B650","Form Factor":"ATX","Wi-Fi":"Included"}},{"specCategory":"Motherboard (Intel CPU)","specValues":{"Model":"B760 ","Form Factor":"ATX","Wi-Fi":"Included"}},{"specCategory":"CPU Cooler","specValues":{"Model":"NZXT T120","Cooling type":"Air Cooler","Dimensions":"120 x 66 x 159 mm","Coldplate material":"Copper","Block material":"-","Display Panel Type":"-","Fan specs":"1 x F120P Static Pressure Fan","RGB":"No"}},{"specCategory":"Cooler Fan","specValues":{"Model":"F120P Static Pressure Fan x1","Speed":"500-1,800 ± 300 RPM","Airflow":"21.67 - 78.02 CFM","Static Pressure":"0.75 - 2.7mm-H2O","Noise":"17.9 - 30.6dBA","Dimension":"120 x 120 x 26mm"}},{"specCategory":"Case Fan - Front","specValues":{"Model":"F120Q - 120mm Quiet Airflow Fans (Case Version) x1","Speed":"500 - 1,200 ± 300 RPM","Airflow":"27.77 - 64 CFM","Static Pressure":"0.45 - 1.08 mm - H₂O","Noise":"16.7 - 22.5 dBA","Dimension":"120 x 120 x 26 mm"}},{"specCategory":"Case Fan - Rear","specValues":{"Model":"F120Q - 120mm Quiet Airflow Fans (Case Version) x1","Speed":"500 - 1,200 ± 300 RPM","Airflow":"27.77 - 64 CFM","Static Pressure":"0.45 - 1.08 mm - H₂O","Noise":"16.7 - 22.5 dBA","Dimension":"120 x 120 x 26 mm"}},{"specCategory":"Power","specValues":{"Model":"650W Gold","Wattage":"650 W","Rating":"80+ Gold"}},{"specCategory":"Case","specValues":{"Model":"NZXT H5 Flow","Motherboard Support":"Mini-ITX, MicroATX, ATX","Front I/O":"1x USB 3.2 Gen 1 Type-A / 1x USB 3.2 Gen 2 Type-C / 1x Headset Audio Jack"}},{"specCategory":"Warranty","specValues":{"Manufacturer's Warranty - Parts":"2 years","Manufacturer's Warranty - Labor":"2 years"}}]`,
      images: [
        "https://www.datocms-assets.com/34299/1727324329-player-1-ww-09-04-24-hero-white-badge.png",
        "https://www.datocms-assets.com/34299/1727324327-player-1-ww-09-04-24-side-white.png",
        "https://www.datocms-assets.com/34299/1727324330-player-1-ww-09-04-24-front-white.png",
      ],
      performance: {
        "Call of Duty Modern Warfare": {
          R1080P: 75,
          R1440P: 50,
          R2160P: 25,
        },
        Fortnite: {
          R1080P: 65,
          R1440P: 40,
          R2160P: 20,
        },
        "Grand Theft Auto V": {
          R1080P: 65,
          R1440P: 40,
          R2160P: 0,
        },
        "League of Legends": {
          R1080P: 200,
          R1440P: 200,
          R2160P: 200,
        },
        Starfield: {
          R1080P: 40,
          R1440P: 30,
          R2160P: 0,
        },
      },
    });

    const cleanedResults = await cleanPrebuiltScrapeResults(nzxt);
    expect(cleanedResults.processedResults).toEqual({
      base_price: new Prisma.Decimal(829),
      cpu_cooler_mm: 120,
      cpu_cooler_type: 'AIR',
      customizable: true,
      front_fan_mm: 120,
      rear_fan_mm: 120,
      os_id: expect.any(String),
      gpu_chipset_id: expect.any(String),
      moba_chipset_id: null,
      main_storage_gb: 1024,
      seconday_storage_gb: null,
      main_storage_type_id: expect.any(String),
      secondary_storage_type_id: undefined,
      memory_modules: 2,
      memory_module_gb: 8,
      memory_speed_id: expect.any(String),
      warranty_months: 24,
      wireless: undefined,
      psu_efficiency_rating: "GOLD",
      psu_wattage: 650
    })
  });
}, 20000);

describe("parts specs scraper", async () => {
  // try {
  //   await prisma.product.deleteMany({
  //     where: {
  //       url: {
  //         startsWith: "file://",
  //       },
  //     },
  //   });
  // } catch (error: any) {
  //   if (error.code !== "P2025") {
  //     console.error(error);
  //     process.exit(error.code);
  //   }
  // }

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
