import { getPuppeteerInstance } from "@/app/api/scrapers/utils";
import prisma from "@/app/db";
import { scraperResults } from "../types";
import { SpecValues, SpecCategory, CategorySpecMap, NZXTSpecs, CPUFanValues, CPUCoolerValues } from "./types";
import { ScriptHTMLAttributes } from "react";
import {serializeNumber} from "@/app/api/scrapers/serializers";
import { get } from "http";
  

export async function scrapeNzxt(url: string): scraperResults {
const [browser, page] = await getPuppeteerInstance(url, ".relative");


  const title = await page.title();
  
  const pageInfo = await page.$eval('#__NEXT_DATA__', (el) => {
    if (!el || !el.textContent) throw Error('No script found');
    return JSON.parse(el.textContent);
  })

  const specs = pageInfo.props.pageProps.data.techTable as SpecValues[]
  

  const keySpecs = getNzxtSpecs(specs, 'Key Specs')
  const softwareSpecs = getNzxtSpecs(specs, 'Software')
  const processorSpecs = getNzxtSpecs(specs, 'Processor')
  const graphicsSpecs = getNzxtSpecs(specs, 'Graphics')
  const memorySpecs = getNzxtSpecs(specs, 'Memory')
  const storageSpecs = getNzxtSpecs(specs, 'Storage')
  const mobaSpecs = getNzxtSpecs(specs, 'Motherboard')
  const cpuCoolerSpecs = getNzxtSpecs(specs, 'CPU Cooler')
  const psuSpecs = getNzxtSpecs(specs, 'Power')
  const caseSpecs = getNzxtSpecs(specs, 'Case')
  const warrantySpecs = getNzxtSpecs(specs, 'Warranty')
  const rearFanSpecs = getNzxtSpecs(specs, 'Cooler Fan')
  const frontFanSpecs = getNzxtSpecs(specs, 'Case Fan - Front')
  
  return {
    prebuilt: {
      psu_w: psuSpecs ? serializeNumber(psuSpecs.Wattage) : null,
      customizable: true,
      front_fan_mm: getFanSize(frontFanSpecs),
      rear_fan_mm: getFanSize(rearFanSpecs),
      cpu_cooler_mm: getFanSize(cpuCoolerSpecs),
      cpu_cooler_type: cpuCoolerSpecs?.["Cooling type"].toLowerCase().includes('air') ? 'AIR' : 'LIQUID',
    },
    prebuiltParts: {
      psu: JSON.stringify(psuSpecs)
    }
}
  await browser.close();

}

// Helper function to get specs with type safety
function getNzxtSpecs<T extends SpecCategory>(
  specs: NZXTSpecs,
  category: T
): CategorySpecMap[T] | null {
  return specs.find(spec => spec.specCategory === category)?.specValues as CategorySpecMap[T] ?? null;
}

export function getFanSize(specs: CPUFanValues | CPUCoolerValues | null | undefined) {
  if (!specs) return null;
  
  if ("Fan specs" in specs) {
    const match = specs["Fan specs"].match(/(\d) x (\w+\d+\w*)/);

    if (match) {
      const number = match[1] && serializeNumber(match[1])
      const size = match[2] && serializeNumber(match[2])
      if (number && size) 
        return number * size;
    }
  }

  if ("Dimension" in specs) {
    const size = specs.Dimension.split('x')[0];
    return serializeNumber(size);
  }
}