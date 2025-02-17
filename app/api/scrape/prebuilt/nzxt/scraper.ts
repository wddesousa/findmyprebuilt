import { getPuppeteerInstance, getCpuBrandName, cleanTrademarks, getCoolerType } from "@/app/api/scrape/utils";
import prisma from "@/app/db";
import {getProduct} from "@/app/db";
import { scraperRawResults , prebuiltTrackerResults} from "../../types";
import { NzxtSpecValues, NzxtSpecCategory, NzxtCategorySpecMap, NZXTSpecs } from "./types";
import { ScriptHTMLAttributes } from "react";
import {serializeNumber} from "@/app/api/scrape/serializers";
import { get } from "http";
import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";
import { findProductUpdates } from "../utils";

export async function scrapeNzxt(url: string): Promise<scraperRawResults> {
const [browser, page] = await getPuppeteerInstance(url, ".relative");
  
  const pageInfo = await page.$eval('#__NEXT_DATA__', (el) => {
    if (!el || !el.textContent) throw Error('No script found');
    return JSON.parse(el.textContent);
  })

  const specs = pageInfo.props.pageProps.data.techTable as NzxtSpecValues[]
  const baseProductInfo = pageInfo.props.pageProps.data.decoratedDefaultUpgradeProducts[0]
  const images = baseProductInfo.images as { url: string }[]

  const gameAcronymMap: Record<string, string> = {
    lol: "League of Legends",
    cod: "Call of Duty Modern Warfare",
    fortnite: "Fortnite",
    gtav: "Grand Theft Auto V",
    starfield: "Starfield"
  }

  const gamePerformance = baseProductInfo.fps
  const performance: scraperRawResults["performance"] = Object.keys(gameAcronymMap).reduce((acc, game) => ({
    ...acc,
    [gameAcronymMap[game]]: {"R1080P": Number(gamePerformance[game]["1080"]), "R1440P": Number(gamePerformance[game]["1440"]), "R2160P": Number(gamePerformance[game]["4k"].split('(')[0])}
  }), {})

  await browser.close();


  const keySpecs = getNzxtSpecs(specs, 'Key Specs')
  const mobaSpecs = getNzxtSpecs(specs, 'Motherboard')
  const cpuCoolerSpecs = getNzxtSpecs(specs, 'CPU Cooler')
  const psuSpecs = getNzxtSpecs(specs, 'Power')
  const caseSpecs = getNzxtSpecs(specs, 'Case')
  const warrantySpecs = getNzxtSpecs(specs, 'Warranty')
  const rearFanSpecs = getNzxtSpecs(specs, 'Cooler Fan')
  const frontFanSpecs = getNzxtSpecs(specs, 'Case Fan - Front')

  return {

    prebuilt: {
      base_price: String(baseProductInfo.variant.price),
      customizable: true,
      front_fan_mm: getFanSize(frontFanSpecs),
      rear_fan_mm: getFanSize(rearFanSpecs),
      cpu_cooler_mm: getFanSize(cpuCoolerSpecs),
      cpu_cooler_type: cpuCoolerSpecs?.["Cooling type"],
      os: keySpecs?.["Operating System"],
      warranty_months: warrantySpecs && warrantySpecs["Manufacturer's Warranty - Parts"] ? String(serializeNumber(warrantySpecs["Manufacturer's Warranty - Parts"]) as number * 12) : null,
      wireless: undefined
    },
    prebuiltParts: {
      psu: `${psuSpecs?.Model} ${psuSpecs?.Rating} ${psuSpecs?.Wattage}`,
      cpu: keySpecs?.["CPU"],
      case: caseSpecs?.Model,
      cpu_cooler: cpuCoolerSpecs?.Model,
      gpu: keySpecs?.["GPU"],
      front_fan: frontFanSpecs?.Model,
      rear_fan: rearFanSpecs?.Model,
      main_storage: keySpecs?.["Storage"],
      second_storage: undefined,
      moba: mobaSpecs?.Model,
      ram: keySpecs?.["RAM"]
    },
    specsHtml: JSON.stringify(specs),
    images: images.map((image) => image.url),
    performance: performance,
    url: url
}

}

export async function nzxtFind(url: string, brand_name: string) {
    let response;
    if (url.includes("file://")) {
      const filePath = fileURLToPath(url);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      response = { data: fileContent };
    } else {
      response = await axios.get(url);
    }

    const $ = cheerio.load(response.data);
    const element = $('#__NEXT_DATA__');
    
    const jsonData = JSON.parse(element.text()); // Convert string to JSON object

    const productGridCards = jsonData.props.pageProps.category.productGridCards
    const firstKey = Object.keys(productGridCards)[0];
    const products = productGridCards[firstKey].map((product: any) => `https://nzxt.com/product/${product.slug}`);

    return findProductUpdates(brand_name, products);
    
}

async function saveSlugs(brand_id: string, slug_list: string[]) {
  //save the sluglist as a string separated by ;
  const slugs = slug_list.join(';');
  return await prisma.productTracker.upsert({
    where: { brand_id: brand_id },
    update: { current_products_slugs: slugs },
    create: { brand_id: brand_id, current_products_slugs: slugs }
  })
}

// Helper function to get specs with type safety
function getNzxtSpecs<T extends NzxtSpecCategory>(
  specs: NZXTSpecs,
  category: T
): NzxtCategorySpecMap[T] | null {
  return specs.find(spec => spec.specCategory === category)?.specValues as NzxtCategorySpecMap[T] ?? null;
}

export function getFanSize(specs: NzxtCategorySpecMap["Cooler Fan"] | NzxtCategorySpecMap["CPU Cooler"] | null | undefined) {
  if (!specs) return null;
  
  if ("Fan specs" in specs) {
    const match = specs["Fan specs"]?.match(/(\d) x (\w+\d+\w*)/);

    if (match) {
      const number = match[1] && serializeNumber(match[1])
      const size = match[2] && serializeNumber(match[2])
      if (number && size) 
        return String(number * size);
    }
  }

  if ("Dimension" in specs) {
    const size = specs.Dimension.split('x')[0];
    return size.trim();
  }
  return null
}