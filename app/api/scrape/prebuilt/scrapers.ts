import { getPuppeteerInstance, getCpuBrandName, cleanTrademarks, getCoolerType } from "@/app/api/scrape/utils";
import prisma from "@/app/db";
import {getProduct} from "@/app/db";
import { scraperRawResults } from "./types/types";
import { NzxtSpecValues, NzxtSpecCategory, NzxtCategorySpecMap, NZXTSpecs } from "./types/nzxt";
import { ScriptHTMLAttributes } from "react";
import {serializeNumber} from "@/app/api/scrape/serializers";
import { get } from "http";
  

export async function scrapeNzxt(url: string): Promise<scraperRawResults> {
const [browser, page] = await getPuppeteerInstance(url, ".relative");


  const title = await page.title();
  
  const pageInfo = await page.$eval('#__NEXT_DATA__', (el) => {
    if (!el || !el.textContent) throw Error('No script found');
    return JSON.parse(el.textContent);
  })

  const specs = pageInfo.props.pageProps.data.techTable as NzxtSpecValues[]
  const images = pageInfo.props.pageProps.data.productImages as { url: string }[]
 console.log(images)
  await browser.close();


  const keySpecs = getNzxtSpecs(specs, 'Key Specs')
  const softwareSpecs = getNzxtSpecs(specs, 'Software')
  const cpuSpecs = getNzxtSpecs(specs, 'Processor')
  const gpuSpecs = getNzxtSpecs(specs, 'Graphics')
  const memorySpecs = getNzxtSpecs(specs, 'Memory')
  const storageSpecs = getNzxtSpecs(specs, 'Storage') ?? getNzxtSpecs(specs, 'Primary Storage')
  const mobaSpecs = getNzxtSpecs(specs, 'Motherboard')
  const cpuCoolerSpecs = getNzxtSpecs(specs, 'CPU Cooler')
  const psuSpecs = getNzxtSpecs(specs, 'Power')
  const caseSpecs = getNzxtSpecs(specs, 'Case')
  const warrantySpecs = getNzxtSpecs(specs, 'Warranty')
  const rearFanSpecs = getNzxtSpecs(specs, 'Cooler Fan')
  const frontFanSpecs = getNzxtSpecs(specs, 'Case Fan - Front')
  const cpuBrand = cpuSpecs?.["Processor Brand"] && getCpuBrandName(cpuSpecs["Processor Brand"])
  const gpuBrand = gpuSpecs?.["Model"] && cleanTrademarks(gpuSpecs["Model"])
  const memoryInfo = memorySpecs?.["Capacity"] ?? memorySpecs?.["Base System Memory"]

  return {

    prebuilt: {
      psu_w: psuSpecs?.Wattage,
      psu_rating: psuSpecs?.Rating,
      customizable: true,
      front_fan_mm: getFanSize(frontFanSpecs),
      rear_fan_mm: getFanSize(rearFanSpecs),
      cpu_cooler_mm: getFanSize(cpuCoolerSpecs),
      cpu_cooler_type: cpuCoolerSpecs?.["Cooling type"],
      os: keySpecs?.["Operating System"],
      warranty_months: warrantySpecs && warrantySpecs["Manufacturer's Warranty - Parts"] ? serializeNumber(warrantySpecs["Manufacturer's Warranty - Parts"]) as number * 12 : null,
      wireless: undefined
    },
    prebuiltParts: {
      psu: psuSpecs?.Model,
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
    images: images.map((image) => image.url)
}

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
        return number * size;
    }
  }

  if ("Dimension" in specs) {
    const size = specs.Dimension.split('x')[0];
    return Number(size.trim());
  }
  return null
}