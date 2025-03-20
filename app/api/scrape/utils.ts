import puppeteer from "puppeteer-extra";
import prisma from "@/app/db";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as cheerio from "cheerio";
import untypedMap from "./serialization-map.json";
import {
  UniversalSerializationMap,
  PrismaModelMap,
  scraperRawResults,
  cleanedResults,
  prebuiltBrands,
} from "./types";
import {
  genericSerialize,
  customSerializers,
  serializeNumber,
  nameSeparators,
  serializeArray,
} from "./serializers";
import { Page, Browser, ElementHandle } from "puppeteer";
import {
  saveCaseFan,
  saveCase,
  savePsu,
  saveCpu,
  saveGpu,
  saveMemory,
  saveMoba,
  saveStorage,
  saveCooler,
} from "./db";
import {
  CpuCoolerType,
  DoubleDataRate,
  PsuRating,
  Prisma,
  Product,
} from "@prisma/client";
import fs from "fs";
import { fileURLToPath } from "url";
import { formFactorSerializer, formFactorSizes } from "@/app/lib/utils";

process.env.DEBUG = "puppeteer:*";

const LAUNCH_CONFIG = {
  headless: true,
  defaultViewport: null,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  args: ["--no-sandbox", "--disable-gpu"],
};
puppeteer.use(StealthPlugin());

export async function getPuppeteerInstance(
  url: string,
  waitForSelector: string
): Promise<[Browser, Page]> {
  // const { browser, page } = await connect({
  //     headless: false,

  //     args: [],

  //     customConfig: {},

  //     turnstile: true,

  //     connectOption: {},

  //     disableXvfb: false,
  //     ignoreAllFlags: false
  // })
  const browser = await puppeteer.launch(LAUNCH_CONFIG);
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on("request", (request) => {
    //mock for local file tests
    if (url.startsWith("file://")) {
      if (
        request.url().startsWith("file://") &&
        ["document"].includes(request.resourceType())
      ) {
        const filePath = fileURLToPath(request.url()); // Remove "file://" from the URL
        const fileContent = fs.readFileSync(filePath, "utf-8");
        request.respond({
          status: 200,
          contentType: "text/html; charset=utf-8",
          body: fileContent,
        });
      } else {
        request.abort();
      }
    } else {
      request.continue();
    }
  });

  const res = await page.goto(url);

  try {
    await page.waitForSelector(waitForSelector, { timeout: 5000 });
  } catch {
    console.error(
      `Initial fetch test failed (HTTP ${
        res?.status() ?? "?"
      }). Try running with \`{ headless: false }\` to see what the problem is.`
    );
    throw new Error(
      `Initial fetch test failed (HTTP ${
        res?.status() ?? "?"
      }). Try running with \`{ headless: false }\` to see what the problem is.`
    );
  }

  return [browser, page];
}

export async function processPartScrapedData(url: string, scrapedData: string) {
  const $ = cheerio.load(scrapedData);
  const product_type = $(".breadcrumb a").text().toLowerCase();
  const productTitleMapping: Record<string, keyof PrismaModelMap> = {
    "video card": "gpu",
    cpu: "cpu",
    motherboard: "moba",
    memory: "memory",
    storage: "storage",
    "cpu cooler": "cooler",
    "power supply": "psu",
    case: "case",
    "case fan": "caseFan",
  };

  const productKey = productTitleMapping[product_type];

  if (typeof productKey === "undefined")
    throw Error(
      `Product type ${product_type} not configured for serialization`
    );

  const serialized = await serializeProduct(productKey, url, $) as unknown as {product: Product};
  return serialized;
}

export async function getSpecName(spec: cheerio.Cheerio) {
  return spec.find(".group__title").text().trim();
}

export async function getSpecValue(spec: cheerio.Cheerio) {
  const value = spec.contents().eq(3).text().trim();

  if (value == null || value.trim() === "") {
    throw new Error(`Spec cannot be undefined or empty`);
  }
  return value;
}

export function getTitle($: cheerio.Root) {
  return $("title:first").text().trim();
}

async function serializeProduct<T extends keyof PrismaModelMap>(
  productType: T,
  url: string,
  $: cheerio.Root
) {
  const serialized: Partial<PrismaModelMap[T]> = {};
  const map = untypedMap as unknown as UniversalSerializationMap;
  const $mainSpecDiv = $(".block.xs-hide.md-block.specs:first");

  if (!$mainSpecDiv) throw Error("Main spec div not found");

  const specs = $mainSpecDiv.find(".xs-hide .group--spec");
  serialized.url = url;

  const title = $("title:first").text();

  const separator = nameSeparators[productType];

  if (typeof separator !== "string")
    serialized.product_name = title.substring(0, await separator($));

  for (const spec of specs) {
    const specName = await getSpecName($(spec));
    const mapped = map[productType][specName];

    if (typeof mapped === "undefined")
      throw new Error(`No mapping found for spec '${specName}'`);

    const [snakeSpecName, mappedSpecSerializationType] = mapped;

    const specValue = await getSpecValue($(spec));
    if (specName === separator)
      serialized.product_name = title.split(specValue)[0];

    //

    if (mappedSpecSerializationType === "custom") {
      serialized[snakeSpecName] =
        customSerializers[productType]![snakeSpecName]!(specValue);
    } else if (mappedSpecSerializationType === "array") {
      serialized[snakeSpecName] = serializeArray(specValue);
    } else {
      serialized[snakeSpecName] = genericSerialize(
        specValue,
        mappedSpecSerializationType
      );
    }
  }

  if (serialized.product_name?.includes(serialized.brand as string))
    serialized.product_name = serialized.product_name
      ?.split(serialized.brand as string)[1]
      .trim();

  switch (productType) {
    case "cpu":
      return await saveCpu(serialized as unknown as PrismaModelMap["cpu"]);
    case "gpu":
      return await saveGpu(serialized as unknown as PrismaModelMap["gpu"]);
    case "moba":
      return await saveMoba(serialized as unknown as PrismaModelMap["moba"]);
    case "memory":
      return await saveMemory(
        serialized as unknown as PrismaModelMap["memory"]
      );
    case "storage":
      return await saveStorage(
        serialized as unknown as PrismaModelMap["storage"]
      );
    case "cooler":
      return await saveCooler(
        serialized as unknown as PrismaModelMap["cooler"]
      );
    case "psu":
      return await savePsu(serialized as unknown as PrismaModelMap["psu"]);
    case "case":
      return await saveCase(serialized as unknown as PrismaModelMap["case"]);
    case "caseFan":
      return await saveCaseFan(
        serialized as unknown as PrismaModelMap["caseFan"]
      );
    default:
      break;
  }

  throw Error("Serializer not defined correctly")
}

function removeTrademarks(scrapeResults: any): any {
  const cleanedResults: any = {};

  for (const key in scrapeResults.prebuiltParts) {
    if (
      Object.prototype.hasOwnProperty.call(scrapeResults.prebuiltParts, key)
    ) {
      const value = scrapeResults.prebuiltParts[key];
      cleanedResults[key] = value ? cleanTrademarks(value) : value;
    }
  }

  return cleanedResults;
}

export async function cleanPrebuiltScrapeResults(
  scrapeResults: scraperRawResults
): Promise<cleanedResults> {
  scrapeResults.prebuiltParts = removeTrademarks(scrapeResults);

  const memoryInfo = getMemoryInfo(scrapeResults.prebuiltParts.ram);
  const mainStorageInfo = await getStorageInfo(
    scrapeResults.prebuiltParts.main_storage
  );
  const secondaryStorageInfo = await getStorageInfo(
    scrapeResults.prebuiltParts.second_storage
  );
  const psuInfo = getPsuInfo(scrapeResults.prebuiltParts.psu);
  const price = getNumber(scrapeResults.prebuilt.base_price);

  const processedResults: cleanedResults["processedResults"] = {
    base_price: price ? new Prisma.Decimal(price.toFixed(2)) : null,
    cpu_air_cooler_height_mm:  getNumber(scrapeResults.prebuilt.cpu_air_cooler_height_mm),
    cpu_aio_cooler_size_mm: getNumber(scrapeResults.prebuilt.cpu_aio_cooler_size_mm),
    customizable: scrapeResults.prebuilt.customizable,
    front_fan_mm: getNumber(scrapeResults.prebuilt.front_fan_mm),
    rear_fan_mm: getNumber(scrapeResults.prebuilt.rear_fan_mm),
    os_id: await findIdByName(scrapeResults.prebuilt.os, "operativeSystem"),
    moba_chipset_id: await findIdByName(
      scrapeResults.prebuiltParts.moba,
      "mobaChipset"
    ),
    moba_form_factor: scrapeResults.prebuilt.moba_form_factor ?? null,
    case_form_factor: scrapeResults.prebuilt.case_form_factor ?? null,
    main_storage_gb: mainStorageInfo.size ?? null,
    secondary_storage_gb: secondaryStorageInfo.size ?? null,
    main_storage_type_id: mainStorageInfo?.type?.id ?? null,
    secondary_storage_type_id: secondaryStorageInfo?.type?.id ?? null,
    memory_modules: memoryInfo.modules.number,
    memory_module_gb: memoryInfo.modules.size,
    memory_speed_mhz: memoryInfo.speed,
    warranty_months: getNumber(scrapeResults.prebuilt.warranty_months),
    wireless: scrapeResults.prebuilt.wireless ?? null,
    psu_efficiency_rating: psuInfo.rating,
    psu_wattage: psuInfo.wattage,
    parts: {
      psu: scrapeResults.prebuiltParts.psu ? cleanTrademarks(scrapeResults.prebuiltParts.psu ) : null,
      cpu:  scrapeResults.prebuiltParts.cpu ? cleanTrademarks(scrapeResults.prebuiltParts.cpu ) : null,
      case:  scrapeResults.prebuiltParts.case ? cleanTrademarks(scrapeResults.prebuiltParts.case ) : null,
      cpu_cooler:  scrapeResults.prebuiltParts.cpu_cooler ? cleanTrademarks(scrapeResults.prebuiltParts.cpu_cooler ) : null,
      gpu:  scrapeResults.prebuiltParts.gpu ? cleanTrademarks(scrapeResults.prebuiltParts.gpu ) : null,
      gpu_chipset:  scrapeResults.prebuiltParts.gpu_chipset ? cleanGpuBrand(scrapeResults.prebuiltParts.gpu_chipset ) : null,
      front_fan:  scrapeResults.prebuiltParts.front_fan ? cleanTrademarks(scrapeResults.prebuiltParts.front_fan ) : null,
      rear_fan:  scrapeResults.prebuiltParts.rear_fan ? cleanTrademarks(scrapeResults.prebuiltParts.rear_fan ) : null,
      main_storage:  scrapeResults.prebuiltParts.main_storage ? cleanTrademarks(scrapeResults.prebuiltParts.main_storage ) : null,
      second_storage:  scrapeResults.prebuiltParts.second_storage ? cleanTrademarks(scrapeResults.prebuiltParts.second_storage ) : null,
      moba:  scrapeResults.prebuiltParts.moba ? cleanTrademarks(scrapeResults.prebuiltParts.moba ) : null,
      ram:  scrapeResults.prebuiltParts.ram ? cleanTrademarks(scrapeResults.prebuiltParts.ram ) : null,
    }
  };

  return {
    rawResults: scrapeResults,
    processedResults: processedResults,
  };
}

export const getAmazonAsin = (url: string) =>
  url.match(/\/dp\/([^\/]+)\//)?.[1];

const getNumber = (value: any) => (value ? serializeNumber(value) : null);
const findIdByName = async (
  name: any,
  model: "operativeSystem" | "gpuChipset" | "mobaChipset" | "formFactor"
) =>
  name
    ? (await (prisma[model] as any).findUnique({ where: { name: name } }))?.id
    : null;
const cleanGpuBrand = (gpu: string) =>
  cleanTrademarks(gpu.replace(/(NVIDIA|AMD|Nvidia) /, ""));

export function getCpuBrandName(cpu: string) {
  if (cpu.toLowerCase().includes("intel")) return "Intel";
  if (cpu.toLowerCase().includes("amd")) return "AMD";
  return null;
}

export function cleanTrademarks(string: string) {
  return string.replaceAll(/(™|®)/g, "").trim();
}

export async function getStorageInfo(storage: string | null | undefined) {
  if (!storage) return { type: null, size: null };
  const type = await getStorageType(storage);
  const size = getStorageSize(storage);
  return {
    type,
    size,
  };
}

export function getLargestFormFactor(forms?: string[]) {
  //normalize possible names
  //if one of the provided names is not in the list then just return undefined so we put it manually when submitting the prebuilt and avoid mistakes

  if (!Array.isArray(forms) || typeof forms[0] !== "string") return undefined;

  const sizeOrder = formFactorSizes;

  const serialize = formFactorSerializer;

  const largest = forms.reduce(
    (acc, curr) => {
      const form = serialize(curr);

      if (sizeOrder[form] === undefined)
        return { form: "MINIITX", formNotFound: true };

      return {
        form:
          sizeOrder[form].weight > sizeOrder[acc.form].weight ? form : acc.form,
        formNotFound: acc.formNotFound,
      };
    },
    { form: "MINIITX", formNotFound: false }
  );

  return largest.formNotFound === true
    ? undefined
    : sizeOrder[largest.form].name;
}

async function getStorageType(storage: any) {
  var type;
  if (storage.toLowerCase().match(/ssd|nvme/)) type = "SSD";
  if (storage.toLowerCase().match(/hdd|hard drive/)) {
    const matchSpeed = storage.toLowerCase().match(/\d+\s?rpm/g);
    if (matchSpeed) type = serializeNumber(matchSpeed[0]) + " RPM";
  }
  return await prisma.storageType.findUnique({ where: { name: type } });
}

function getStorageSize(storage: any) {
  if (!storage) return null;
  var match = storage.toLowerCase().match(/\d+\s?gb/g);
  if (match) {
    return serializeNumber(match[0]);
  }
  match = storage.toLowerCase().match(/\d+\s?tb/g);
  if (match) {
    const tbs = serializeNumber(match[0]);
    return tbs ? tbs * 1024 : null;
  }
}

export function getPsuInfo(psu: string | null | undefined): {
  rating: PsuRating;
  wattage: number | null;
} {
  // there is 0 chance there's a prebuilt being sold with a PSU that is not 80+ rated so will assume that
  if (!psu) return { rating: PsuRating.NONE, wattage: null };

  return {
    rating: getPsuRating(psu),
    wattage: getPsuWattage(psu),
  };
}

function getPsuWattage(psu: string) {
  const match = psu.toLowerCase().match(/\d+\s?w/g);
  if (match) {
    return serializeNumber(match[0]);
  }
  return null;
}

function getPsuRating(psu: string): PsuRating {
  const match = psu
    .toUpperCase()
    .match(/TITANIUM|PLATINUM|GOLD|SILVER|BRONZE/g);
  if (match) {
    return match[0] as PsuRating;
  }
  return PsuRating.NONE;
}

export function getCoolerType(cooler?: string): CpuCoolerType | null {
  if (!cooler) return null;
  if (cooler.toLowerCase().includes("air")) return "AIR";
  if (cooler.toLowerCase().match(/aio|liquid/)) return "AIO";
  return null;
}
export function getMemoryInfo(memory: string | null | undefined) {
  if (!memory)
    return { speed: null, modules: { number: null, size: null } };

  const speed = getMemorySpeed(memory);
  const modules = getMemoryModules(memory);

  return {
    speed,
    modules,
  };
}

function getMemorySpeed(memory: string) {
  const match = memory.toLowerCase().match(/\d+\s?mhz/g);
  if (match) {
    return serializeNumber(match[0]);
  }
  return null;
}

function getMemoryModules(memory: string) {
  var match = memory.toLowerCase().match(/\d x \d+\s?gb/g);
  if (match) {
    const [number, size] = match[0].split("x").map(serializeNumber);
    return {
      number,
      size,
    };
  }

  match = memory.toLowerCase().match(/\d+\s?gb x \d/g);
  if (match) {
    const [size, number] = match[0].split("x").map(serializeNumber);
    return {
      number,
      size,
    };
  }
  return { number: null, size: null };
}

export async function getBrandFromSlug(
  params: Promise<{
    slug: string;
  }>
) {
  return (await params).slug.replace("-", " ") as prebuiltBrands;
}
