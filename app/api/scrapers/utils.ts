import puppeteer from "puppeteer-extra";
import { connect } from "puppeteer-real-browser";
import prisma from "@/app/db"
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import untypedMap from "./serialization-map.json";
import {
  UniversalSerializationMap,
  PrismaModelMap,
  MobaChipsetSpecs,
} from "./types";
import {
  genericSerialize,
  customSerializers,
  serializeNumber,
  nameSeparators,
  serializeArray,
} from "./serializers";
import { Page, Browser, ElementHandle } from "puppeteer";
import { spec } from "node:test/reporters";
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
import { CpuCoolerType } from "@prisma/client";

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
    // Block all external resources when opening local files for testing
    if (request.url().startsWith("file://") && !["document", "xhr", "fetch"].includes(request.resourceType())) {
        request.abort();
     } else {
        request.continue();
      }
    }
  );

  const res = await page.goto(url, {  waitUntil: "domcontentloaded" });

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

export async function scrapeAndSavePart(url: string) {
  const [browser, page] = await getPuppeteerInstance(url, "nav");
  const product_type = await page.$eval(".breadcrumb a", (l) =>
    (l as HTMLAnchorElement).innerText.toLowerCase()
  );

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

  const serialized = await serializeProduct(productKey, page);
  await browser.close();
  return serialized;
}

export async function getSpecName(spec: ElementHandle<Element>) {
  return spec.$eval(".group__title", (l) =>
    (l as HTMLHeadingElement).innerText.trim()
  );
}

export async function getSpecValue(spec: ElementHandle<Element>) {
  const value = await spec.evaluate((s) =>
    s.childNodes[3]?.textContent?.trim()
  );
  if (value == null || value.trim() === "") {
    throw new Error(`Spec cannot be undefined or empty`);
  }
  return value;
}

export async function getTitle(page: Page) {
  return page.$eval(".pageTitle", (l) =>
    (l as HTMLHeadingElement).innerText.trim()
  );
}

async function serializeProduct<T extends keyof PrismaModelMap>(
  productType: T,
  page: Page
) {
  const serialized: Partial<PrismaModelMap[T]> = {};
  const map = untypedMap as unknown as UniversalSerializationMap;
  const mainSpecDiv = await page.$(".block.xs-hide.md-block.specs");

  if (!mainSpecDiv) throw Error("Main spec div not found");

  const specs = await mainSpecDiv.$$(".xs-hide .group--spec");
  serialized.url = page.url();

  const title = await getTitle(page);

  const separator = nameSeparators[productType];

  if (typeof separator !== "string")
    serialized.product_name = title.substring(0, await separator(page));

  for (const spec of specs) {
    const specName = await getSpecName(spec);
    const mapped = map[productType][specName];

    if (typeof mapped === "undefined")
      throw new Error(`No mapping found for spec '${specName}'`);

    const [snakeSpecName, mappedSpecSerializationType] = mapped;

    const specValue = await getSpecValue(spec);
    if (specName === separator)
      serialized.product_name = title.split(specValue)[0];

    //

    if (mappedSpecSerializationType === "custom") {
      console.log(snakeSpecName);
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
}

export function getCpuBrandName(string: string) {
  if (string.toLowerCase().includes("intel")) return "Intel"; 
  if (string.toLowerCase().includes("amd")) return "AMD"; 
  return null
}

export function cleanTrademarks(string: string) {
  return string.replaceAll(/(™|®)/g, "").trim();
}

export async function getStorageTypeId(string:string) {
  var type;
  if (string.toLowerCase().match(/ssd|nvme/)) 
    type = "SSD";
  if (string.toLowerCase().match(/hdd|hard drive/)) {
    type = serializeNumber(string) + " RPM"
  }
  return (await prisma.storageType.findUnique({where: {name: type}}))?.id
}

export async function getPsuRating(string: string) {

}

export function getCoolerType(string: string): CpuCoolerType | null {
  if (string.toLowerCase().includes("air")) return "AIR"; 
  if (string.toLowerCase().match(/aio|liquid/)) return "LIQUID"; 
  return null
}